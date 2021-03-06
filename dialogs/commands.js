CKEDITOR.dialog.add( 'speechCommandsDialog', function ( editor ) {
  var lang = editor.lang.speech;
    return {
        title: lang.xspoken,
        minWidth: 400,
        minHeight: 200,

        contents: [
            {
                id: 'tab-spoken',
                label: lang.xspoken, //'Spoken Commands',
                elements: [

{
    type: 'html',
      id: 'voiceCmds',
    html: '<table spellcheck="false"><thead><th>'+lang.saythis+'</th><th>'+lang.dothis+'</th></thead><tbody></tbody></table>'
}
            ]
            },
            {
                id: 'tab-editable',
                label: lang.editable, //'Commands',
                elements: [

{
    type: 'html',
      id: 'editableCmds',
    html: '<table spellcheck="false"><thead><th>'+lang.saythis+'</th><th>'+lang.dothis+'</th></thead><tbody><tr><td><input type=text></td><td><input type=text style=width:250px></td></tbody></table>&nbsp; <input type=button value=+ style=background:#09863e;width:15px;text-align:center;border-radius:2px;cursor:pointer>'
}
            ]
            },
            {
                id: 'tab-characters',
                label: lang.xspecial, //'Special Characters',
                elements: [

{
    type: 'html',
      id: 'voiceChars',
    html: `
  <p style="text-align:center">${lang.punctnote}.</p>
  <br>
  <table spellcheck="false">
  <thead><th>${lang.saythis}</th><th>${lang.typethis}</th></thead>
    <tbody>
    <tr><td>${lang.http}</td>           <td>http:&#47;&#47;</td></tr>
    <tr><td>${lang.comma}</td>          <td>,</td></tr>
    <tr><td>${lang.period}</td>         <td>.</td></tr>
    <tr><td>${lang.fullstop}</td>       <td>.</td></tr>
    <tr><td>${lang.colon}</td>          <td>:</td></tr>
    <tr><td>${lang.dollars}</td>        <td>$</td></tr>
    <tr><td>${lang.exclamation}</td>    <td>!</td></tr>
    <tr><td>${lang.newline}</td>        <td>\\n</td></tr>
    <tr><td>${lang.newpara}</td>        <td>\\n\\n</td></tr>
    <tr><td>${lang.percent}</td>        <td>%</td></tr>
    <tr><td>${lang.times}</td>          <td>x</td></tr>
    <tr><td>${lang.slash}</td>          <td>&#47;</td></tr>
    <tr><td>${lang.ellipses}</td>       <td>...</td></tr>
    <tr><td>${lang.atsign}</td>         <td>@</td></tr>
    <tr><td>${lang.asterisk}</td>       <td>*</td></tr>
    <tr><td>${lang.hashtag}</td>        <td>#</td></tr>
    <tr><td>${lang.ampersand}</td>      <td>&amp;</td></tr>
    <tr><td>${lang.backslash}</td>      <td>&#92;</td></tr>
    <tr><td>${lang.semicolon}</td>      <td>;</td></tr>
    <tr><td>${lang.curlybracket}</td>   <td>{...}</td></tr>
    <tr><td>${lang.squarebracket}</td>  <td>[...]</td></tr>
    <tr><td>${lang.parentheses}</td>    <td>( )</td></tr>
    <tr><td>${lang.quotationmark}</td>  <td>&quot;...&quot;</td></tr>
    <tr><td>${lang.longdash}</td>       <td>&mdash;</td></tr>
    <tr><td>${lang.dash}</td>           <td>&ndash;</td></tr>
    <tr><td>${lang.underscore}</td>     <td>_</td></tr>
  
  </tbody></table>`
}


            ]
            }
        ],
            
      onShow: function(e){
        // get element
        var id1 = this.getContentElement('tab-spoken','voiceCmds').domId,
        id2 = this.getContentElement('tab-characters','voiceChars').domId,
        id3 = this.getContentElement('tab-editable','editableCmds').domId,
        speech = this.getParentEditor().plugins.speech,
        ele1 = document.getElementById(id1),
        ele2 = document.getElementById(id2).querySelector("table"),
        ele3 = document.getElementById(id3),
        commands = speech.getCommands(),
        translate = speech.getTranslate();
        ele3.contentEditable = true;
        
        ele3.nextElementSibling.onclick=function(e){
          window.tr = ele3.querySelector("tbody>tr");
          cn = tr.cloneNode(true);
          tr.insertAdjacentElement('afterend', cn);
        };
        
        // style table
        var tdstyle = "box-shadow: inset 0 1px 2px rgba(0,0,0,.39), 0 -1px 1px #FFE, 0 1px 0 #FFE; padding-left: 3px";
        ele1.tHead.style="background: rgb(234, 236, 253);";
        ele1.querySelectorAll("th").forEach(e=>e.style.fontWeight="bold");
        ele2.style.background="rgb(234, 236, 253)";
        ele2.querySelectorAll("th").forEach(e=>e.style.fontWeight="bold");
        ele2.querySelectorAll("td").forEach(e=>e.style=tdstyle);
        ele3.style.background="rgb(234, 236, 253)";
        ele3.querySelectorAll("th").forEach(e=>e.style.fontWeight="bold");
        ele3.querySelectorAll("td").forEach(e=>e.style=tdstyle);
        
        // clear commands table
        var trs = ele1.querySelectorAll("tr");
        for (var i = 1; trs[i]; i++) trs[i].remove();
        // create reverse lookup language dictionary
        var dict = {};
        if (typeof translate != "undefined" && translate)
        Object.keys(translate).forEach(function(e){
          if(e.slice(-1)==" ")
            dict[e] = translate[e];
          else
            dict[translate[e]] = e;
        });
        
        function htmlEnt(t){
          return t.replace('<', '&lt;').replace('>', '&gt;');
        }
        function entHtml(t){
          return t.replace('&lt;', '<').replace('&gt;', '>');
        }
        
        // build editable commands table dialog
        Object.keys(commands).forEach(function(k){
          var tr = document.createElement('tr');
          var  td1 = document.createElement('td');
          td1.style = tdstyle;
          td1.innerHTML = (k in dict)? dict[k] : k;
          var td2 = document.createElement('td');
          td2.innerHTML=htmlEnt(commands[k]); td2.style = tdstyle;
          tr.appendChild(td1); tr.appendChild(td2);
          ele1.appendChild(tr);
        });
      },
      onOk: function(e){
        // get element
        var id = this.getContentElement('tab-editable','editableCmds').domId;
        var ele = document.getElementById(id);
        
        
        
      }
    }
});