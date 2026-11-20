# cairn-landing

The website of Cairn, the sovereign, open source AI stack:
[opencairn.ai](https://opencairn.ai).

## Layout

```
public/
  index.html                              Page structure and the architecture diagram (no copy)
  copy/en.js, copy/fr.js                  All the text on the page, one file per language
  css/styles.css                          Styles; light and dark color tokens at the top
  js/app.js                               Fills in the copy; pop-ups, theme switch, PNG download
  vendor/html-to-image.min.js             Renders the diagram to PNG (MIT, loaded on click)
  fonts/SpaceGrotesk-Variable.woff2       Brand typeface, from the design system (OFL)
  assets/cairn-logo*.svg                  Wordmark (deep purple and cream), from the design system
  assets/og-card.png                      Share card for link previews (from reference/og-card/)
  site.webmanifest, robots.txt, sitemap.xml
reference/og-card/og-card.html            Share card source; how to regenerate it is inside
.github/workflows/pages.yml               Publishes public/ to GitHub Pages on every push to main
```

## Contributing, security and conduct

See [CONTRIBUTING.md](CONTRIBUTING.md). To report a vulnerability, see
[SECURITY.md](SECURITY.md). Do not open a public issue for it. Everyone follows
the [code of conduct](CODE_OF_CONDUCT.md).

## License

Apache License 2.0, see [LICENSE](LICENSE). Two parts have their own license:

- Space Grotesk (`public/fonts/`): SIL Open Font License, see `public/fonts/OFL.txt`.
- html-to-image (`public/vendor/`): MIT, see `public/vendor/html-to-image.LICENSE.txt`.

The license gives no right to use the Cairn name and logos (section 6 of the
license).
