/**                                       -*- coding: utf-8 -*-
* Google Speech API Plugin for CKeditor 4.5.5
* February 1, 2017 by Henry Kroll III, www.thenerdshow.com
* 
* Adapted from:
* Google. (2017). Web Speech API Demonstration. Retrieved February 01, 2017 from view-source:https://www.google.com/intl/en/chrome/demos/speech.html  
* Agarwal, A. (2016). How to Add Speech Recognition to your Website. [tutorial] Retrieved February 01, 2017 from https://www.labnol.org/software/add-speech-recognition-to-website/19989/
* CKSource. (2017). Creating a CKEditor Plugin in 20 Lines of Code Retrieved February 01, 2017 from http://docs.cksource.com/CKEditor_3.x/Tutorials/Timestamp_Plugin
*/
( function() {
"use strict";
var editor1 = CKEDITOR.instances[(Object.keys(CKEDITOR.instances)[0])];

CKEDITOR.plugins.add( 'speech',
{
	init: function( editor1 )
	{
		//Plugin logic goes here.
	}
} );

editor1.addCommand( 'help',
	{
		exec : function( editor1 )
        {
            // load content from edit_help.html
            window.open(CKEDITOR.getUrl("plugins/speech/edit_help.html"), '_blank');
        }
	});

editor1.ui.addButton( 'Help',
{
	label: 'Speech Help Alt+F1',
	command: 'help',
	icon: 'plugins/speech/system-help.gif', // http://fedoraproject.org/
    toolbar: 'editing'
} );

editor1.addCommand( 'speech',
	{
		exec : function( editor1 )
        {
            startDictation( editor1 );
        }
	});

editor1.ui.addButton( 'Speech',
{
	label: 'Speech Dictation Alt+D',
	command: 'speech',
	icon: 'plugins/speech/mic.gif',
    toolbar: 'editing'
} );

/*To use the recognition and synthesis parts of the spec in Firefox when it becomes available, you’ll need to enable the media.webspeech.recognition.enable and media.webspeech.synth.enabled flags in about:config.
https://hacks.mozilla.org/2016/01/firefox-and-the-web-speech-api/
*/
  var recognizing = false;
  function startDictation(editor) {
    var mic_id = editor.ui.get("Speech")._.id;
    var mic = document.getElementById(mic_id);
    var final_transcript = '';
    if (recognizing) {
      recognizing = false;
      mic.style.background = "";
      if (typeof recognition != "undefined") {
        recognition.stop();
      }
      return;
    }
    var bot = document.querySelector("#cke_1_bottom");
    if(!bot) bot = document.querySelector("#cke_1_top");
    var interim_span = document.createElement("span");
    bot.appendChild(interim_span);
    recognizing = true;
    var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    // var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    // var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    if (SpeechRecognition) {
      window.recognition = new SpeechRecognition();
      
      // Timeout of continuous recognition is too long
      // so we use non-continuous and restart it.
      recognition.continuous = false;
      recognition.interimResults = true;
      // default to browser's lang setting http://stackoverflow.com/questions/18557494/how-to-detect-users-language
      recognition.lang = window.navigator.language
            || navigator.userLanguage || "en-US";
      recognition.start();
      mic.style.background = "salmon";
      
      recognition.onend = function() {
        if (final_transcript) insertText(editor, final_transcript);
        final_transcript = "";
        if (recognizing) {
            recognition.start();
            mic.style.background = "salmon";
        }
        else {
            recognition.stop();
            mic.style.background = "";
        }
      };
      
      recognition.onresult = function(e) {
        var interim_transcript = '';
        if (typeof(event.results) == 'undefined') {
          recognition.onend = null;
          recognition.stop();
          mic.style.background = "";
          return;
        }
        for (var i = e.resultIndex; i < e.results.length; ++i) {
          if (e.results[i].isFinal) {
            final_transcript += linebreak(e.results[i][0].transcript);
          } else {
            interim_transcript += e.results[i][0].transcript;
          }
        }
        interim_span.innerHTML = linebreak(interim_transcript);
      };
      
      recognition.onerror = function(e) {
        recognizing = false;
        recognition.stop();
        mic.style.background = "";
      }
    }
  }
var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}
var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

/** getLR by Henry Kroll, www.thenerdshow.com
* Get text to the left and right of current selection
* These are CKEditor ranges. They have their own syntax.
* within parent of selection nodes.
*/
// hints from http://stackoverflow.com/questions/4811822/get-a-ranges-start-and-end-offsets-relative-to-its-parent-container
function getLR() { 
    // get text to left of cursor
    var s = editor1.getSelection(),
    ro = s.getRanges()[0],
    rsc = ro.startContainer, roff = ro.startOffset,
    rc = ro.clone();
    rc.selectNodeContents(ro.getCommonAncestor());
    rc.setEnd(rsc, roff);
    var rcc = rc.cloneContents(),
    l = rcc.$.textContent;
    if (rc.startContainer.$.firstChild === ro.startContainer.$){
        l = l.substr(0, ro.startOffset);
    }
    // get text to right of cursor
    rc.selectNodeContents(ro.getCommonAncestor());
    rc.setStart(ro.endContainer, ro.endOffset);
    var rcc = rc.cloneContents(),
    r = rcc.$.textContent; // text to right of cursor
    return [l,r];
}

/** delete i chars in range
* These are CKEditor ranges. They have their own syntax.
*/
function del(range, i) {
    var rc = range.clone();
    if (rc.startContainer.$.nodeType == 3) { // is a text node
        rc.setStart(range.startContainer, range.startOffset);
        rc.setEnd(range.startContainer, range.startOffset + i + 1);
    }
    else { // nodetype 1
        var a = rc.getNextNode();
        if (a.$.nodeType == 3) {
            rc.selectNodeContents(a);
            rc.setStart(a, i);
            var l = rc.startContainer.$.textContent.length;
            if (l < i + 1) {
                rc.setEnd(rc.getNextEditableNode(), i - l + 1);
            } else {
                rc.setEnd(a, 1 + i);
    }   }   }
    rc.deleteContents();
    // restores sanity to the range, sort of...
    var a = rc.getNextNode();
    rc.selectNodeContents(a);
    rc.collapse();
    return rc;
}

/** backspace
* These are CKEditor ranges. They have their own syntax.
*/
function bs(range) {
    var rc = range.clone();
    if (rc.startContainer.$.nodeType == 3) { // is a text node
        var rsc = range.startContainer, roff = range.startOffset;
        rc.selectNodeContents(range.getCommonAncestor());
        rc.setEnd(rsc, roff);
        rc.setStart(rc.endContainer, rc.endOffset - 1);
    }
    else { // nodetype 1
        rc.selectNodeContents(rc.getPreviousNode());
        rc.startOffset = rc.endOffset - 1;
    }
    rc.deleteContents();
}

// restores sanity to the range, sort of...
function fixRange(range) {
    var rc = range.clone();
    var a = rc.getNextNode();
    if(a){
        rc.setEnd(a, 0);
        rc.collapse();
    }
    return rc;
}

/** insertText by Henry Kroll, www.thenerdshow.com
* @param {object} editor instance
* @param {string} text to insert
*/
function insertText(editor1, txt) {
    // undo command (Kroll, February 01, 2017)
    if (txt == "whoops"
     || txt == "what's"
     || txt == "undo"
    ) return editor1.undoManager.undo();
    
    if (txt == "select all") {
        // from epokk. (February 03, 2017). How to select the content of CKEditor ? [forum post] http://ckeditor.com/forums/CKEditor-3.x/SOLVED-How-select-content-CKEditor
        editor1.focus();
        return editor1.document.$.execCommand('SelectAll', false, null);
    }
    
    if (txt == "maximize") {
        return editor1.execCommand("maximize");
    }
    
    if (txt == "file save") {
        return fileSave(editor1);
    }
    
    // fix missing punctuation in dictation AI (Kroll, February 03, 2017)
    txt = txt.replace(/HTTP colon slash slash\s?/i, "http://");
    txt = txt.replace(/make a link to (.*\.\w+)/i, 
        function(match, $1){ return " <a href=\"http://" +$1.replace(/\s/g, "")});
    txt = txt.replace(/\s?with link text\s?(.*)/i,
        function(match, $1){ return "\">"+$1+"</a> " });
    txt = txt.replace(/\s?apostrophe\s?/gi, "&apos;");
    txt = txt.replace(/\s?tab key\s?/gi, "\t");
    txt = txt.replace(/\s?ellipses/gi, "&hellip;");
    txt = txt.replace(/ampersand/gi, "&amp;");
    txt = txt.replace(/\s?asterisk/gi, "*");
    txt = txt.replace(/at sign/gi, "@");
    txt = txt.replace(/\s?at symbol\s?/gi, "@");
    txt = txt.replace(/\s?backslash\s?/gi, "\\");
    txt = txt.replace(/open bracket\s?/gi, "[");
    txt = txt.replace(/\s?close bracket/gi, "]");
    txt = txt.replace(/\s?colon$/gi, ":");
    txt = txt.replace(/\s?comma/gi, ",");
    txt = txt.replace(/\s?semicolon$/gi, ";");
    txt = txt.replace(/open parentheses\s?/gi, "(");
    txt = txt.replace(/\s?close parentheses/gi, ")");
    txt = txt.replace(/less.than symbol\s?/gi, "&lt;");
    txt = txt.replace(/\s?greater.than symbol/gi, "&gt;");
    txt = txt.replace(/open quote\s?/gi, "\"");
    txt = txt.replace(/\s?close quote/gi, "\"");
    txt = txt.replace(/open.?.? curly quote\s?/gi, "&ldquo;");
    txt = txt.replace(/\s?close.? curly quote/gi, "&rdquo;");
    txt = txt.replace(/\s?long dash\s?/gi, "&mdash;");
    txt = txt.replace(/\s?short dash\s?/gi, "&ndash;");
    txt = txt.replace(/\s?-\s?/gi, "-");
    txt = txt.replace(/ degrees Fahrenheit\s?/gi, "&deg;F");
    txt = txt.replace(/ degrees Ceckeditor_wiris_formulaEditor','ckeditor_wiris_formulaEditorChemistry','ckeditor_wiris_CASlsius\s?/gi, "&deg;C");
    txt = txt.replace(/\s?copyright symbol\s?/gi, "&copy;");
    txt = txt.replace(/\s?trademark symbol\s?/gi, "&trade;");

    // from Browse Tutorials. (June, 2015). Get Cursor Position in CKEditor. Retrieved February 01, 2017 from https://browse-tutorials.com/snippet/get-cursor-position-ckeditor
    var selection = editor1.getSelection();
    var range = selection.getRanges()[0];
    // Capitalization / punctuation logic is for right-to-left
    // languages, so we prepared an if statement to check this.
    // March 06, 2017
    var t = range.getCommonAncestor().$;
    var rtl = getComputedStyle(t.parentElement).direction;
    if (rtl == "ltr") {
        var [l,r] = getLR();
        // Only capitalize sentences (Kroll, February 02, 2017)
        var bt = ""; // look for previous punctuation
        var at = ""; // look ahead for text
        var unCap = false;
        var reCap = false;
        var i,rc;
        // look <-|-> two spaces each way for punctuation
        bt = l.substr(- 2, 2);
        at = r.substr(0, 2);
        // if inserting a sentence in the middle of another sentence 
        // we want to break it up and reCap the new start
        var m = r.match(/^\s*[a-z]/); // text after selection is lower
        i = m? m[0].length:0; // i= pos. of lower case word start
        if (i // if followed by lower case letter
            && txt.match(/[.:!?…]$/) // and txt ends with .
        ) { // break sentence and reCap new start
            rc = del(range, i -= 1);
            reCap = true;
            txt = txt + " ";
        }
        // if starting with punctuation in the middle of a sentence 
        if (!range.checkStartOfBlock() && txt.match(/^[.,-@:!?"'…]/)){
            // erase any trailing spaces before the .
            if (bt.match(/\s$/)){
                rc = bs(range);
            }
            m = txt.match(/^[ .:!?…]*[a-z]/);
            var j = m? m[0].length - 1: -1;
            // Capitalize the text to insert, if there is any
            if (j >= 0) {
                txt = txt.substr(0, j) + txt[j].toUpperCase()
                + txt.substr(j+1);
            }
        }
        if (range.checkStartOfBlock() || bt.match(/[.:!?…]/)) {
            txt = capitalize(txt);
            // uncap next sentence if inserting new text at start
            unCap = at.match(/[A-Z]/) && txt.match(/[^.:!?…]\s?$/);
        }
        // Only insert space if necessary (Kroll, February 02, 2017)
        if (!range.checkStartOfBlock()     // when continuing a line
            && bt.match(/\S$/)   // after non-space,
            && txt[0].match(/[^.,-@:!?'…]/)) { // & not adding punctuation
            txt = " " + txt;
        }
        // Add space at end if caret is followed by text, unless single
        if (at.match(/^\w/) && !txt.match(/^[^a-z]$/i)) txt = txt + " ";
        // uncap sentence if adding text to the beginning
        // unless the added text is a complete sentence
        if (unCap){
            // see https://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html
            // see http://docs.ckeditor.com/#!/api/CKEDITOR.dom.range
            // delete next character.
            i = at.search(/[A-Z]/);
            rc = del(range, i);
        }
        rc = fixRange(range);
    }
    editor1.insertHtml(txt);
    if (unCap) {
        var t = editor1.document.createText(
            at[i].toLowerCase());
        rc.insertNode(t);
    } 
    if (reCap) {
        var t = editor1.document.createText(
            at[i].toUpperCase());
        rc.insertNode(t);
    }
    if (rc) {
        var p = range.getCommonAncestor();
        if (p && p.normalize) p.normalize();
    }
}
} )();
/**
* end Google Speech API Plugin
*/
