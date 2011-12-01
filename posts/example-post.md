Title: Example Post
SubTitle: All about Markdown

Markdown is a text-to-HTML conversion tool for web writers. Markdown allows you to write using an easy-to-read, easy-to-write plain text format, then convert it to structurally valid XHTML (or HTML).

Thus, "Markdown" is two things: (1) a plain text formatting syntax; and (2) a software tool, written in Perl, that converts the plain text formatting to HTML. See the [Syntax][] page for details pertaining to Markdown's formatting syntax. You can try it out, right now, using the online [Dingus][].

  [syntax]: http://daringfirebal.net/projects/markdown/syntax
  [dingus]: http://daringfirebal.net/projects/markdown/dingus

The overriding design goal for Markdown's formatting syntax is to make it as readable as possible. The idea is that a Markdown-formatted document should be publishable as-is, as plain text, without looking like it's been marked up with tags or formatting instructions. While Markdown's syntax has been influenced by several existing text-to-HTML filters, the single biggest source of inspiration for Markdown's syntax is the format of plain text email.

The best way to get a feel for Markdown's formatting syntax is simply to look at a Markdown-formatted document. For example, you can view the Markdown source for the article text on this page here:
<http://daringfireball.net/projects/markdown/index.text>

(You can use this '.text' suffix trick to view the Markdown source for the content of each of the pages in this section, e.g. the [Syntax][s_src] and [License][l_src] pages.)

  [s_src]: http://daringfirebal.net/projects/markdown/syntax.text
  [l_src]: http://daringfirebal.net/projects/markdown/license.text

Markdown is free software, available under a BSD-style open source license. See the [License] [pl] page for more information.

  [pl]: http://daringfirebal.net/projects/markdown/license

###Configuration  <a id="configuration"></a>

By default, Markdown produces XHTML output for tags with empty elements.
E.g.:

    <br />

Markdown can be configured to produce HTML-style tags; e.g.:

    <br>

### Command-Line ###

Use the `--html4tags` command-line switch to produce HTML output from a Unix-style command line. E.g.:

    % perl Markdown.pl --html4tags foo.text

Type `perldoc Markdown.pl`, or read the POD documentation within the Markdown.pl source code for more information.
