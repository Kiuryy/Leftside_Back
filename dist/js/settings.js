/*! Leftside Back v1.3.3 | (c) Philipp König under GPL-3.0 */
"use strict";!function(a){var b={saved:"saved",restored:"restored"},c={body:a("body"),title:a("head > title"),rangeInputs:a("input[type='range']"),pxToleranceMaximized:a("input#pxToleranceMaximized"),pxToleranceWindowed:a("input#pxToleranceWindowed"),addVisual:a("input#addVisual"),closeTab:a("input#closeTab"),save:a("button#save"),restoreDefaults:a("button#restore"),copyright:a("span#copyright")},d=function(){a("[data-i18n]").forEach(function(b){var c=a(b).attr("data-i18n");a(b).text(chrome.i18n.getMessage("settings_"+c))})},e=function(){var b=chrome.runtime.getManifest();c.title.text(b.short_name+" - "+a("head > title").text());var d=+c.copyright.children("span.created").text(),e=(new Date).getFullYear();e>d&&c.copyright.children("span.created").text(d+" - "+e),chrome.storage.sync.get("addVisual",function(a){c.addVisual[0].checked="undefined"==typeof a.addVisual||"y"===a.addVisual}),chrome.storage.sync.get("closeTab",function(a){c.closeTab[0].checked="undefined"!=typeof a.closeTab&&"y"===a.closeTab}),chrome.storage.sync.get("pxTolerance",function(a){var b={windowed:20,maximized:1};"undefined"!=typeof a.pxTolerance&&(b=JSON.parse(a.pxTolerance)),c.pxToleranceMaximized[0].value=b.maximized,c.pxToleranceWindowed[0].value=b.windowed,c.pxToleranceMaximized.trigger("change"),c.pxToleranceWindowed.trigger("change")})};c.rangeInputs.on("input change",function(b){a(b.currentTarget).next("span").text(b.currentTarget.value)}),c.save.on("click",function(a){chrome.storage.sync.set({addVisual:c.addVisual[0].checked?"y":"n",closeTab:c.closeTab[0].checked?"y":"n",pxTolerance:JSON.stringify({windowed:c.pxToleranceWindowed[0].value,maximized:c.pxToleranceMaximized[0].value})},function(){c.body.addClass(b.saved),setTimeout(function(){c.body.removeClass(b.saved)},1500)})}),c.restoreDefaults.on("click",function(){chrome.storage.sync.remove(["addVisual","closeTab","pxTolerance"],function(){c.body.addClass(b.restored),setTimeout(function(){c.body.removeClass(b.restored),setTimeout(function(){window.close()},100)},1500)})}),d(),e()}(jsu);