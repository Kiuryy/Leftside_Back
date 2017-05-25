/*! (c) Philipp König under GPL-3.0 */

"use strict";!function(e){var o={saved:"saved",restored:"restored"},n={body:e("body"),title:e("head > title"),rangeInputs:e("input[type='range']"),pxToleranceMaximized:e("input#pxToleranceMaximized"),pxToleranceWindowed:e("input#pxToleranceWindowed"),showIndicator:e("input#showIndicator"),openAction:e("select#openAction"),closeTab:e("input#closeTab"),save:e("button#save"),restoreDefaults:e("button#restore"),copyright:e("span#copyright")};n.rangeInputs.on("input change",function(o){e(o.currentTarget).next("span").text(o.currentTarget.value)}),n.save.on("click",function(e){chrome.storage.sync.set({showIndicator:n.showIndicator[0].checked,closeTab:n.closeTab[0].checked,openAction:n.openAction[0].value,pxTolerance:{windowed:n.pxToleranceWindowed[0].value,maximized:n.pxToleranceMaximized[0].value}},function(){n.body.addClass(o.saved),setTimeout(function(){n.body.removeClass(o.saved)},1500)})}),n.restoreDefaults.on("click",function(){chrome.storage.sync.remove(["showIndicator","closeTab","pxTolerance","openAction"],function(){n.body.addClass(o.restored),setTimeout(function(){n.body.removeClass(o.restored),setTimeout(function(){window.close()},100)},1500)})}),function(){e("[data-i18n]").forEach(function(o){var n=e(o).attr("data-i18n");e(o).text(chrome.i18n.getMessage("settings_"+n))});var o=chrome.runtime.getManifest();n.title.text(o.short_name+" - "+n.title.text())}(),function(){var e=+n.copyright.children("span.created").text(),o=(new Date).getFullYear();o>e&&n.copyright.children("span.created").text(e+" - "+o),chrome.storage.sync.get("showIndicator",function(e){n.showIndicator[0].checked=void 0===e.showIndicator||!0===e.showIndicator}),chrome.storage.sync.get("closeTab",function(e){n.closeTab[0].checked=void 0!==e.closeTab&&!0===e.closeTab}),chrome.storage.sync.get("openAction",function(e){n.openAction[0].value=void 0===e.openAction?"mousedown":e.openAction}),chrome.storage.sync.get("pxTolerance",function(e){var o={windowed:20,maximized:1};void 0!==e.pxTolerance&&(o=e.pxTolerance),n.pxToleranceMaximized[0].value=o.maximized,n.pxToleranceWindowed[0].value=o.windowed,n.pxToleranceMaximized.trigger("change"),n.pxToleranceWindowed.trigger("change")})}()}(jsu);