import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.TreeMap;
import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import org.w3c.dom.*;
import org.xml.sax.*;
import org.xml.sax.helpers.DefaultHandler;

// Authored fixture assertions, not schema validation or a Spring filter-chain test.
public final class CsrfConfigTest {
    static final String EGOV = "http://maven.egovframe.go.kr/schema/egov-security";
    static final String BEANS = "http://www.springframework.org/schema/beans";
    static final String SECURITY = "http://www.springframework.org/schema/security";
    static int checks, failures;

    static Document parse(String xml) throws Exception {
        var f = DocumentBuilderFactory.newInstance();
        f.setNamespaceAware(true);
        f.setValidating(false);
        f.setXIncludeAware(false);
        f.setExpandEntityReferences(false);
        f.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        f.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        f.setFeature("http://xml.org/sax/features/external-general-entities", false);
        f.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
        f.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        f.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "");
        f.setAttribute(XMLConstants.ACCESS_EXTERNAL_SCHEMA, "");
        var b = f.newDocumentBuilder();
        b.setEntityResolver((publicId, systemId) -> { throw new SAXException("External access forbidden"); });
        b.setErrorHandler(new DefaultHandler() {
            @Override public void fatalError(SAXParseException e) throws SAXException { throw e; }
        });
        return b.parse(new InputSource(new StringReader(xml)));
    }

    static void check(String name, boolean ok) {
        checks++;
        if (!ok) failures++;
        System.out.println((ok ? "PASS " : "FAIL ") + name);
    }

    static void rejects(String name, String xml) throws Exception {
        boolean rejected = false;
        try { parse(xml); } catch (SAXParseException expected) { rejected = true; }
        check(name, rejected);
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 1 || !(args[0].equals("vulnerable") || args[0].equals("fixed")))
            throw new IllegalArgumentException("Use vulnerable or fixed");
        var root = parse(Files.readString(Path.of(args[0] + ".xml"))).getDocumentElement();
        check("beans namespace", BEANS.equals(root.getNamespaceURI()));
        String schema = BEANS + " " + BEANS + "/spring-beans-4.0.xsd "
                + SECURITY + " " + SECURITY + "/spring-security.xsd "
                + EGOV + " " + EGOV + "/egov-security-4.0.0.xsd";
        check("pinned schema locations", schema.equals(root.getAttributeNS(
                XMLConstants.W3C_XML_SCHEMA_INSTANCE_NS_URI, "schemaLocation").trim().replaceAll("\\s+", " ")));
        var configs = root.getElementsByTagNameNS(EGOV, "config");
        check("one namespaced config", configs.getLength() == 1);
        if (configs.getLength() != 1) throw new AssertionError("Missing or ambiguous config");
        var config = (Element) configs.item(0);
        Map<String, String> attrs = new TreeMap<>();
        for (int i = 0; i < config.getAttributes().getLength(); i++) {
            var a = config.getAttributes().item(i);
            if (!a.getNodeName().equals("csrf")) attrs.put(a.getNodeName(), a.getNodeValue());
        }
        check("unrelated attributes preserved", attrs.equals(Map.of(
                "csrfAccessDeniedUrl", "/egovCSRFAccessDenied.do",
                "requestMatcherType", "regex", "xssProtection", "true",
                "jdbcMapClass", "egovframework.com.sec.security.common.EgovSessionMapping")));
        rejects("internal entities forbidden", "<!DOCTYPE beans [<!ENTITY x 'value'>]><beans>&x;</beans>");
        rejects("external DTD forbidden", "<!DOCTYPE beans SYSTEM 'urn:blocked'><beans/>");
        check("csrf must be enabled", "true".equals(config.getAttribute("csrf")));
        System.out.printf("%s checks=%d passed=%d failed=%d%n", args[0], checks, checks - failures, failures);
        if (failures != 0) System.exit(1);
    }
}
