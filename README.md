# SpeechPad CKEditor SpeechPad Voice Editor Plugin

Realtime speech recognition *plus* voice controlled editing commands for [CKEditor-4](https://ckeditor.com/ckeditor-4/). 

Copyright &copy; 2020 Henry Kroll III. See LICENSE.txt for details. -- henry @ [thenerdshow.com](https://thenerdshow.com/)

## Implementations

SpeechPad now has its own website. [speak.ml](https://speak.ml/)

It's a fully-functional, voice-controlled web page editor supporting 70 languages!

Configure it to save work periodically, so you can shut down and continue at any time.

## Other sites using SpeechPad plugin

### [fails.us](https://fails.us) - Voice-operated web design, social media, and search.

# Installation

## For an [Elgg](https://elgg.org/) installation.

Put this project's files in a folder called "speech" inside the 
[CKEditor-4](https://ckeditor.com/ckeditor-4/download/)  
"plugins" directory.

```
/my-www-root/my-website.com/vendor/elgg/elgg/mod/ckeditor/vendors/ckeditor/plugins/speech/
```
Edit config.js

```
/my-www-root/my-website.com/vendor/elgg/elgg/mod/ckeditor/views/default/elgg/ckeditor/config.js
```

Add `speech` to the line that says `extraPlugins`.

```
extraPlugins: 'autogrow,speech',
```

### Optional [CKEditor 
Addons](https://github.com/hypeJunction/Elgg-ckeditor_addons) plugin 
for [Elgg](https://elgg.org/).

[CKEditor Addons](https://github.com/hypeJunction/Elgg-ckeditor_addons) 
permits turning CKEditor menu items on and off and permits reserving 
some functions for admin users.

We have to modify two more files to make SpeechPad and other plugins work 
with the optional CKEditor Addons plugin. Remove `views.php` if 404 errors show up in the webserver logs complaining about a missing `ckeditor/assets/` directory. Change start.php:

```
/my-www-root/my-website.com/mod/ckeditor_addons/start.php
```

Add SpeechPad menu items to the 'editing' line:

```
'editing' => ['Find', 'Replace', 'SelectAll', 'Scayt', 'SpeechHelp', 'Speech'],
```

Next, modify setup.js.php:

```
/my-www-root/my-website.com/mod/ckeditor_addons/views/default/components/ckeditor/setup.js.php
```

Add `speech` to the line that says `extraPlugins`. 

## For any other website.

You must have [CKEditor-4](https://ckeditor.com/ckeditor-4/download/) 
already working. This plugin targets version 4.11.x.

Put this project's files in a folder called "speech" inside CKEditor's 
"plugins" directory.

```
/my-www-root/my-website.com/ckeditor/plugins/speech
```

CKEditor has extensive documentation to set up different versions, and 
some of it is contradictory. See the included `example.html` for a 
configuration that is known to work. Customize and move it to your 
webserver directory.

```
/my-www-root/my-website.com/example.html
```

Thank you for using [CKEditor](https://ckeditor.com/ckeditor-4/) 
SpeechPad Voice Editor Plugin.
