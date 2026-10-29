FROM docker.io/library/node@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5
WORKDIR /fixture
COPY --chown=0:0 app.mjs driver.mjs probe.mjs /fixture/
RUN touch /podori-write-probe && chown 1000:1000 /podori-write-probe && chmod 0600 /podori-write-probe
USER 1000:1000
ENTRYPOINT ["/usr/bin/timeout", "--signal=KILL", "45", "/usr/local/bin/node", "/fixture/app.mjs"]
CMD []
