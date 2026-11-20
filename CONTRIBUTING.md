# Contributing

This repository holds the website of Cairn, [opencairn.ai](https://opencairn.ai).
Cairn is the sovereign, open source AI stack from Mozilla and Mila.

The stack is in a different repository,
[opencairn-ai/cairn-stack](https://github.com/opencairn-ai/cairn-stack), which
opens with the Alpha release. Send changes to the stack, the recipes and the
roadmap to that repository. This repository only shows them.

## What helps

- **Text that is wrong or not clear.** All the text of the site is in
  `public/copy/en.js` (English) and `public/copy/fr.js` (French). Tell us which
  sentence, and what a reader understands from it.
- **French text.** The French text follows the recommendations of the Office
  québécois de la langue française (OQLF). Tell us when a term is not the term
  that you use.
- **Accessibility problems.** For example, a part of the site that you cannot use
  with a keyboard or a screen reader, or text with too little contrast.
- **Display problems.** Tell us the page, the browser, the window width and the
  language.
- **Broken links.**

For a small correction, open a pull request. For a larger change, open an issue
first. Then we can tell you if we can accept the change before you do the work.

## How we write

The English text follows Simplified Technical English:

- Write short sentences in the active voice.
- Use familiar, precise words.
- Use one term for one concept on all pages. Use the terms that the site
  already uses, for example "schema" (not "diagram") and "Alpha release".

When you change an English text, you do not have to change the French text. We
translate it after we approve the English text.

## Preview a change

The site has no build step. Serve the `public/` folder:

```sh
python3 -m http.server -d public 8080
```

Then open http://localhost:8080. Check the change in English and in French
(`?lang=fr`), in the light and dark themes, and in a window as narrow as a phone.

## Pull requests

- Fork the repository and open the pull request from your fork. Only
  maintainers make branches in this repository.
- Make one change in one pull request.
- Link the issue, if there is one.

A merge to `main` publishes the site. A maintainer reviews each pull request
before the merge.

We read all issues and pull requests. We cannot reply to all of them, and we do
not promise a response time. If an issue gets no reply, add a comment to it.

## Security

Do not open a public issue for a security problem. Send an email to
**security@opencairn.ai**. See [SECURITY.md](SECURITY.md).

## Code of conduct

Cairn follows Mozilla's Community Participation Guidelines. See
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). It applies to this repository, its
issues and pull requests, and to the maintainers. To report a problem, send an
email to **conduct@opencairn.ai**.

## License

This repository is under the Apache License 2.0. See [LICENSE](LICENSE). When you
contribute, you agree that your contribution is under the same license (section 5
of the license). You do not sign a contributor license agreement.
