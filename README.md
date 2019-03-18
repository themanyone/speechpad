# CKEditor Speech+ Voice Editor Plugin

Realtime speech recognition *plus* voice controlled editing commands for [CKEditor-4](https://ckeditor.com/ckeditor-4/).

Copyright &copy; 2019 Henry Kroll III. See LICENSE.txt for details. -- henry @ [thenerdshow.com](https://thenerdshow.com/)

## Quit losing work!

Most people should use our voice controlled HTML editor at [https://thenerdshow.com/edit.html](https://thenerdshow.com/edit.html).

Our online editor saves work periodically, so you can shut down and continue at any time.

## Other sites using Speech+ plugin

### [fails.us](https://fails.us) - Voice-operated web design, social media, and search.

* "Everything" mentioned on fails.us *becomes searchable* at *[everything.fails.us](http://everything.fails.us)*.
* Blogs mentioning Trump appear at [trump.fails.us](http://Trump.fails.us) and [trump.isawesome.cf](http://Trump.isawesome.cf).
* Our [everything.fails.us](http://everything.fails.us) searchlinks are clickable on Twitter without URL shorteners.
* Sign up via Twitter and check the box to echo postings to Twitter.

> Fails.us searchlinks are automatically mirrored to these other great domains.

* [yourbrand.eq2.us](http://yourbrand.eq2.us)
* [yourbrand.fails.us](http://yourbrand.fails.us)
* [yourbrand.talkback.tk](http://yourbrand.talkback.tk)
* [yourbrand.bartertown.tk](http://yourbrand.bartertown.tk)
* [yourbrand.onaboat.tk](http://yourbrand.onaboat.tk)
* [yourbrand.equal.cf](http://yourbrand.equal.cf)
* [yourbrand.equalto.cf](http://yourbrand.equalto.cf)
* [yourbrand.equals.cf](http://yourbrand.equals.cf)
* [yourbrand.isawesome.cf](http://yourbrand.isawesome.cf)
* [yourbrand.isfine.cf](http://yourbrand.isfine.cf)
* [yourbrand.likesthis.cf](http://yourbrand.likesthis.cf)
* [yourbrand.likethis.cf](http://yourbrand.likethis.cf)
* [yourbrand.withgoats.cf](http://yourbrand.withgoats.cf)
* [yourbrand.inabox.cf](http://yourbrand.inabox.cf)
* [yourbrand.withafox.cf](http://yourbrand.withafox.cf)

# Installation

## For an [Elgg](https://elgg.org/) installation.

Put this project's files in a folder called "speech" inside CKEditor's 
"plugins" directory. If there are problems, try CKEditor version 
4.5.5.

```
/my-www-root/my-website.com/vendor/elgg/elgg/mod/ckeditor/vendors/ckeditor/plugins/speech
```
Edit config.js

```
/my-www-root/my-website.com/vendor/elgg/elgg/mod/ckeditor/views/default/elgg/ckeditor/config.js
```

Add `speech` plugin to the line that says `extraPlugins`.

```
extraPlugins: 'autogrow,paste_image,open_save,speech',
```

## For any other website.

You must have [CKEditor-4](https://ckeditor.com/ckeditor-4/download/) 
already working. This plugin targets version 4.11.x.

Put this project's files in a folder called "speech" inside CKEditor's 
"plugins" directory.

```
/my-www-root/my-website.com/ckeditor/plugins/speech
```

CKEditor has extensive documentation and some of it is outdated. See 
the included `example.html` for a configuration that is known to work. Move it to your website's location.

```
/my-www-root/my-website.com/example.html
```

Thank you for using [CKEditor](https://ckeditor.com/ckeditor-4/) 
Speech+ Voice Editor Plugin.
