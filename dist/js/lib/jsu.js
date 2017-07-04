/*! (c) Philipp König under GPL-3.0 */
(()=>{"use strict";let e="isDefined",t="forEach",s={["delay"]:(e=0)=>new Promise(t=>{setTimeout(t,e)})},n=(s=>{let r=document,i=new WeakMap,l=new WeakMap,h=Symbol(),o="_fillNodeList",a="get",p="remove",u="_addEventListener",c="_cloneEventListener",f="_addData",d="_cloneData",g="_cloneElement",m="_htmlText",b="_moveElement",y="_moveElementTo",v="_nextPrev",w="_siblings",E="_realDimension";return class{constructor(e,t=!0){let s=e;if("string"==typeof e&&(!1===t||e.search("<")>-1)){let t=r.createElement("div");t.innerHTML=e,s=t.childNodes}this[o](s)}[o](i){if(s[e](i))if(i instanceof n)this[h]=i[a]();else if("string"==typeof i)this[h]=r.querySelectorAll(i);else if(i instanceof Node||i instanceof HTMLDocument||i instanceof Window)this[h]=[i];else if(i instanceof NodeList||i instanceof HTMLCollection)this[h]=i;else{if("object"!=typeof i)throw new DOMException("invalid parameter for jsu");this[h]=[],s[e](i[t])||(i=[i]),i[t](e=>{let r=e=>{-1===this[h].indexOf(e)&&this[h].push(e)};e instanceof n?e[t](r):Array.isArray(e)||e instanceof NodeList||e instanceof HTMLCollection||/^\[object (HTMLCollection|NodeList|Object)\]$/.test(e.toString())?s[t](e,r):this[h].push(e)})}else this[h]=[];this[t]((e,t)=>{this[t]=e})}[t](e,n=!1){return s[t](this[h],e,n),this}["css"](n,r){let i=!1,l=s[e](n),o=s[e](r),a=[];return this[t](e=>{l&&o&&"string"==typeof n?(e.style[n]=r,i=!0):l&&("string"==typeof n?a.push(window.getComputedStyle(e)[n]):"object"==typeof n&&(i=!0,Object.keys(n)[t](t=>{"string"==typeof t&&(e.style[t]=n[t])})))}),i?this:this[h].length>1?a:a[0]}["attr"](n,r){let i=!1,l=s[e](n),o=s[e](r),a=[];return this[t](h=>{let p=(t,n)=>{i=!0,s[e](h[t])?h[t]=n:h.setAttribute(t,n)};l&&o&&"string"==typeof n?p(n,r):l&&("string"==typeof n?a.push((t=>s[e](h[t])?h[t]:h.getAttribute(t))(n)):"object"==typeof n&&Object.keys(n)[t](e=>{"string"==typeof e&&p(e,n[e])}))}),i?this:this[h].length>1?a:a[0]}["removeAttr"](e){return this[t](t=>{t.removeAttribute(e)}),this}static[u](t,n){let r=i.get(t);s[e](r)||(r={},i.set(t,r)),r[n.event]||(r[n.event]=[]),r[n.event].push({fn:n.fn,opts:n.opts,wantsUntrusted:n.wantsUntrusted}),t.addEventListener(n.event,n.fn,n.opts,n.wantsUntrusted)}static[c](r,l){let h=i.get(r);s[e](h)&&Object.keys(h)[t](e=>{h[e][t](t=>{n[u](l,{event:e,fn:t.fn,opts:t.opts,wantsUntrusted:t.wantsUntrusted})})}),l.children&&s[t](l.children,(e,t)=>{n[c](r.children[t],e)})}static[f](t,n,r){let i=l.get(t);s[e](i)||(i={},l.set(t,i)),i[n]=r}static[d](r,i){let h=l.get(r);s[e](h)&&Object.keys(h)[t](e=>{n[f](i,e,h[e])}),i.children&&s[t](i.children,(e,t)=>{n[d](r.children[t],e)})}static[g](e){let s=[];return e[t](e=>{let t=e.cloneNode(!0);n[c](e,t),n[d](e,t),s.push(t)}),new n(s)}["clone"](){return n[g](this)}["data"](r,i){let o=!1,a=s[e](r),p=s[e](i),u=[];return this[t](h=>{let c=l.get(h),d=s[e](c);a&&p?(o=!0,n[f](h,r,i)):a?"string"==typeof r?u.push(d?c[r]:void 0):"object"==typeof r&&(o=!0,Object.keys(r)[t](e=>{"string"==typeof e&&n[f](h,e,r[e])})):u.push(d?c:{})}),o?this:this[h].length>1?u:u[0]}["removeData"](n){let r=!s[e](n);return this[t](t=>{let i=l.get(t);s[e](i)&&(r?l.delete(t):s[e](i[n])&&delete i[n])}),this}["on"](e,r,i,l,h){let o=(e,s)=>{Object.keys(s)[t](t=>{try{Object.defineProperty(e,t,{value:s[t]})}catch(e){}})},a=i;"function"==typeof i?a=l:h=l,void 0===a&&(a=null),void 0===h&&(h=null);let p="string"==typeof r;return this[t](l=>{e.split(/\s+/g)[t](e=>{n[u](l,{event:e,fn:n=>{o(n,{type:e}),p?s[t](l.querySelectorAll(":scope "+r),t=>{let s=n.target;for(;s&&s!==l;){if(s===t){let t=new MouseEvent(e,n);o(t,{preventDefault:()=>{n.preventDefault()},stopPropagation:()=>{n.stopPropagation()},target:n.target,currentTarget:s}),i(t)}s=s.parentNode}}):"function"==typeof r&&r(n)},opts:a,wantsUntrusted:h})})},!0),this}["off"](n){return this[t](r=>{let l=i.get(r);if(s[e](l)){let e=n.split(/\s+/g);e[t](e=>{l[e]&&s[t](l[e],(t,s)=>{r.removeEventListener(e,t.fn),l[e].splice(s,1)},!0)})}}),this}["trigger"](e,s){return e.split(/\s+/g)[t](e=>{let n=new Event(e,s);this[t](e=>{e.dispatchEvent(n)})}),this}["addClass"](e){return this[t](t=>{t.classList.add(e)}),this}["removeClass"](e){return this[t](t=>{t.classList.remove(e)}),this}["toggleClass"](e){return this[t](t=>{t.classList.toggle(e)}),this}["hasClass"](e){let s=[];return this[t](t=>{s.push(t.classList.contains(e))}),this[h].length>1?s:s[0]}[E](e,s=!1){let n=[],r="width",i=["left","right"];return"h"===e&&(r="height",i=["top","bottom"]),this[t](e=>{let t=e.getBoundingClientRect(),l=window.getComputedStyle(e),h=t[r];s&&(h+=parseInt(l.getPropertyValue("margin-"+i[0])),h+=parseInt(l.getPropertyValue("margin-"+i[1]))),n.push(h)}),this[h].length>1?n:n[0]}["realWidth"](e=!1){return this[E]("w",e)}["realHeight"](e=!1){return this[E]("h",e)}["find"](e){let s=[];return this[t](t=>{t instanceof HTMLIFrameElement?s.push(t.contentDocument.querySelectorAll(":scope "+e)):s.push(t.querySelectorAll(":scope "+e))}),new n(s)}["children"](e){let s=[];return e||(e="*"),this[t](t=>{s.push(t.querySelectorAll(":scope > "+e))}),new n(s)}[m](n,r){let i=s[e](n),l=i?this:"";return this[t](e=>{i?e[r]=n:l+=e[r]}),l}["html"](e){return this[m](e,"innerHTML")}["text"](e){return this[m](e,"innerText")}[p](){this[t](e=>{e&&e.parentElement&&(i.delete(e),l.delete(e),e.parentElement.removeChild(e))})}[b](e,s=!0,r){"string"==typeof e&&e.search("<")>-1&&(s=!1);let i=new n(e,s);return this[t](e=>{n[g](i)[t](t=>{switch(r){case"append":e.appendChild(t);break;case"prepend":e.insertBefore(t,e.firstChild);break;case"before":e.parentNode.insertBefore(t,e);break;case"after":e.parentNode.insertBefore(t,e.nextSibling)}})}),i[p](),this}[y](e,s){let r=[];return new n(e)[t](e=>{n[g](this)[t](t=>{switch(s){case"append":e.appendChild(t);break;case"prepend":e.insertBefore(t,e.firstChild);break;case"before":e.parentNode.insertBefore(t,e);break;case"after":e.parentNode.insertBefore(t,e.nextSibling)}r.push(t)})}),this[p](),new n(r)}["append"](e,t){return this[b](e,t,"append")}["appendTo"](e){return this[y](e,"append")}["prepend"](e,t=!0){return this[b](e,t,"prepend")}["prependTo"](e){return this[y](e,"prepend")}["before"](e,t=!0){return this[b](e,t,"before")}["insertBefore"](e){return this[y](e,"before")}["after"](e,t=!0){return this[b](e,t,"after")}["insertAfter"](e){return this[y](e,"after")}[v](r,i){let l=s[e](r),h=[];return this[t](t=>{let n="prev"===i?t.previousElementSibling:t.nextElementSibling;s[e](n)&&(!l||s[e](n.matches)&&n.matches(r))&&h.push(n)}),new n(h)}["next"](e){return this[v](e,"next")}["prev"](e){return this[v](e,"prev")}[w](r,i="siblings"){let l=s[e](r),o=[];return this[t](e=>{let t=null,s=[];for("siblings"===i&&e.parentNode.firstElementChild?(t=e.parentNode.firstElementChild,i="next"):"previous"!==i&&"next"!==i||(t=e[i+"ElementSibling"]);t&&t.matches;)t===e||l&&!t.matches(r)||s.push(t),t=t[i+"ElementSibling"];o.push(new n(s))}),this[h].length>1?o:o[0]}["siblings"](e){return this[w](e)}["nextAll"](e){return this[w](e,"next")}["prevAll"](e){return this[w](e,"previous")}["parent"](r){let i=s[e](r),l=[];return this[t](t=>{let h=t.parentNode;!i||s[e](h.matches)&&h.matches(r)||(h=null),l.push(new n(h))}),this[h].length>1?l:l[0]}["parents"](r){let i=s[e](r),l=[];return this[t](e=>{let t=[],s=e.parentNode;for(;s&&s.matches&&s!==this;)i&&!s.matches(r)||t.push(s),s=s.parentNode;l.push(new n(t))}),this[h].length>1?l:l[0]}["document"](){let e=[];return this[t](t=>{e.push(new n(t.ownerDocument))}),this[h].length>1?e:e[0]}["eq"](e){return e<0&&(e=this[h].length+e),new n(this[h][e])}[a](t){return s[e](t)?(t<0&&(t=this[h].length+t),this[h][t]):this[h]}["length"](){return this[h].length}}})(class{static[e](e){return void 0!==e&&null!==e}static[t](s,n,r=!1){let i=s.length;if(r){for(let l=i-1;l>=0;l--)if(this[e](s[l][t]))this[t](s[l],n,r);else if(!1===n(s[l],l))break}else for(let l=0;l<i;l++)if(this[e](s[l][t]))this[t](s[l],n,r);else if(!1===n(s[l],l))break}});(()=>{let e=e=>new n(e);Object.entries(s).forEach(([t,s])=>{e[t]=s}),window.jsu=e})()})();