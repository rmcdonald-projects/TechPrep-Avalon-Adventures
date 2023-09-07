`use strict`;

/*  ----------
    Globals...
    ---------- */

const modals = document.querySelectorAll(`.modal-container`);
const modalPics = document.querySelectorAll(`.is-modal-pic`);
const pols = document.querySelectorAll(`.polaroid`);
const formInputs = document.querySelectorAll(`#contact input:not([type="button"]), #contact textarea`);
const headElem = document.querySelector(`header`);
const headLogo = document.getElementById(`header-logo`);
const videos = document.querySelectorAll(`video`);
const videoOverlays = document.querySelectorAll(`.hero-overlay`);
const scrollDownButton = document.getElementById(`scroll-to-bottom`);
const scrollUpButton = document.getElementById(`scroll-to-top`);
const RSSFeeds = document.querySelectorAll(`.rss-feed`);
const animatedElements = document.querySelectorAll(`[data-add-animation]`);


/*  ----------------
    Slideshow logic:
    ---------------- */
const sliderBtns = document.querySelectorAll(`.nav-dot`);
const slides = document.querySelectorAll(`div.slide`);
const slideshowDiv = document.querySelector(`.slideshow`);
const defaultSlideSpeed = 8; //    seconds per slide...
let slideSpeed = defaultSlideSpeed, slideActive = 0, activeInterval = false;
let sliderNav = function (activateSlide, userClick = false) {
    if (activeInterval) { clearTimeout(activeInterval); }
    if (activateSlide >= slides.length) { activateSlide = 0; }
    if (!slideshowDiv.classList.contains(`paused`) || userClick == true) {
        sliderBtns.forEach((btn, i) => {
            btn.classList.remove(`active`);
            slides[i].classList.remove(`active`);
        });
        sliderBtns[activateSlide].classList.add(`active`);
        slides[activateSlide].classList.add(`active`);
        slideActive = activateSlide;
        if (!slideshowDiv.classList.contains(`paused`)) {
            slideActive = activateSlide + 1;
            slideSpeed = defaultSlideSpeed;
        }
        if (userClick) { slideSpeed = defaultSlideSpeed * 2; }    //   after a user clicks, let the slide sit before resuming automation...
    }
    activeInterval = setTimeout(sliderNav, slideSpeed * 1000, slideActive, false);
}

sliderBtns.forEach((btn, i) => {
    btn.addEventListener(`click`, () => {
        sliderNav(i, true);
    })
});

if (sliderBtns.length > 0) {
    sliderNav(0, false);
}

function toggleSlideshowPause(isVis = true) {
    if (isVis != false) { isVis = true; }
    if (isVis) { slideshowDiv.classList.remove(`paused`); } else { slideshowDiv.classList.add(`paused`); }
    return;
}

/*  -----------------------
    Window onload events...
    ----------------------- */

window.onload = (event) => {
    toggleHeaderBG();
    updateMediaCaptions();
    pols.forEach(elem => polaroidSetSize(elem));
};

/*  ------------------
    Event listeners...
    ------------------ */

/*  Click events... */

//  Modal popups...

modalPics.forEach(elem => {
    elem.addEventListener(`click`, (event) => {
        let x = document.getElementById(`temp-cite`);
        if (x) { x.remove(); }
        if (elem.classList.contains(`fullscreen`)) {
            elem.classList.remove(`fullscreen`);
            document.body.style.overflowY = `scroll`;
        } else {
            let cite = document.createElement(`span`);
            cite.id = `temp-cite`;
            cite.classList.add(`citation-watermark`);
            cite.style.zIndex = '11';
            elem.appendChild(cite);
            let fsError = toggleFullscreen(elem);
            if (fsError) {
                elem.classList.add(`fullscreen`);
                document.body.style.overflowY = `hidden`;
            }
        }
    });
});
document.addEventListener(`fullscreenchange`, (event) => {
    if (!document.fullscreenElement) {
        let x = document.getElementById(`temp-cite`);
        if (x) { x.remove(); }
    }
});

modals.forEach(elem => {
    let useElem = elem;
    if (!useElem.classList.contains(`modal-container`)) {
        useElem = useElem.parentElement;
    }
    if (useElem.classList.contains(`modal-container`)) {
        useElem.addEventListener(`click`, (event) => {
            let useModal = useElem.querySelector(`:scope > .modal-pop`);
            if (useModal) {
                let maxFontSize = parseFloat(getComputedStyle(event.target).getPropertyValue('font-size').replace(`px`, ``));
                if (useModal.classList.contains(`disappear`)) {
                    let useText = useModal.innerHTML;
                    let fs = textFitter(useText, ``, ``, ``, useModal) || 10;
                    fs = Math.min(fs, maxFontSize);
                    useModal.style.fontSize = fs + `px`;
                    useModal.classList.remove(`disappear`);
                    document.body.style.overflowY = `hidden`;
                } else {
                    useModal.classList.add(`disappear`);
                    document.body.style.overflowY = `scroll`;
                }
            }
        });
    }
});

//  Video play/pause on click of overlay...
videos.forEach(elem => {
    //  Remove controls embedded in the HTML in case JavaScript is disabled...
    elem.removeAttribute(`controls`);
});
videoOverlays.forEach(elem => {
    elem.addEventListener(`click`, (event) => {
        videos.forEach(vElem => {
            toggleVideoPause(vElem, { "isClick": true });
        });
    })
})

/*  Resize events...    */

//  "Polaroid" image resizing...
const polWatcher = new ResizeObserver((entries) => {
    for (let entry of entries) {
        polaroidSetSize(entry.target);
    }
});
pols.forEach(elem => polWatcher.observe(elem));

/*  RSS feeds...    */
const URLPattern = /(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?/g;
RSSFeeds.forEach(elem => {
    let feedURL = elem.dataset.feedURL || false;
    if (feedURL && feedURL.match(URLPattern)) {
        let fontColour = getComputedStyle(elem).getPropertyValue(`color`);
        let fontFamily = getComputedStyle(elem).getPropertyValue(`font-family`);
        let fontSize = getComputedStyle(elem).getPropertyValue(`font-size`);
        let bgColour = getComputedStyle(elem).getPropertyValue(`background-color`);
        console.log(fontColour, fontFamily, fontSize, bgColour);
        //  Third-party service to create and return an RSS widget from a specified URL...
        let srcURL = `https://p3k.org/rss/main.js?align=initial&amp;boxFillColor=%23${bgColour}&amp;compact=false&amp;fontFace=${fontSize}%20${fontFamily}&amp;frameColor=%23${fontColour}&amp;headless=false&amp;height=&amp;linkColor=%23${fontColour}&amp;maxItems=2&amp;radius=5&amp;showXmlButton=false&amp;textColor=%23${fontColour}&amp;titleBarColor=${bgColour}&amp;titleBarTextColor=${fontColour}&amp;url=${feedURL}`;
        /*  For future development...
            fetch(srcURL)
                .then(response => response.text())
                .then(str => new window.DOMParser().parseFromString(str, "text/xml"))
                .then(data => console.log(data)); */
    }
});

/*  Scrolling...    */
/*  To prevent an overload of scroll events (or infinite recursive loops), the
    scroll function uses a "throttle". This code is borrowed from Bogdan Bendziukov
    (https://medium.com/@bogdanfromkyiv/something-to-know-about-resizing-in-javascript-d2ddcd708bf4). */

window.addEventListener(`scroll`, scrollThrottler, false);
let scrollTimeout; // timeout ID...
function scrollThrottler() {
    // ignore scroll events as long as an actualScrollHandler execution is in the queue...
    if (!scrollTimeout) {
        // set a timeout to prevent multiple events firing...
        scrollTimeout = setTimeout(function () {
            scrollTimeout = null;

            //  -----------------------------------------
            //  Actual scrolling functions called here...
            //  -----------------------------------------
            //  Header styling...
            toggleHeaderBG();
            //  Grey out scroll buttons based on current scroll position...
            greyScrollButtons();
            //  -----------------------------------------

            // The actualScrollHandler will execute at a rate of 15fps...
        }, 66);
    }
}

//  Intersection Observers (visibility of elements)...

//  Pause videos and slideshows when not visible (for any reason)...
const videoThreshold = 0.25;
const pauseObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        let intersectVisible = (entry.intersectionRatio >= videoThreshold) || false;
        if (entry.target.tagName == `VIDEO`) {
            toggleVideoPause(entry.target, { "intersectCall": true, "intersectVisible": intersectVisible });
        } else {
            if (entry.target.classList.contains(`slideshow`)) {
                toggleSlideshowPause(intersectVisible);
            }
        }
    }
    );
}, { threshold: videoThreshold });

videos.forEach(element => {
    pauseObserver.observe(element);
});

if (slideshowDiv) {
    pauseObserver.observe(slideshowDiv);
}

//  Start animations only when elements come into view...
const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            let animClasses = entry.target.dataset.addAnimation.split(`^[,;]+$`);
            animClasses.forEach(anim => {
                anim = anim.trim();
                if (anim.length > 0) {
                    entry.target.classList.add(anim);
                }
            });
            //  Animations are one-and-done: remove used observers...
            observer.unobserve(entry.target);
        }
    });
}, { threshold: .1 });

animatedElements.forEach(element => {
    animationObserver.observe(element);
});


/*  ----------------------------------------------------------------------------------------
    Contact form inputs...
    "blur":     when the element loses focus, check for errors...
    "keyup":    while the user is actively changing the values, remove any error messages...
    ---------------------------------------------------------------------------------------- */
formInputs.forEach(elem => {
    //    if (elem.type != `tel`) {
    //elem.addEventListener(`blur`, (event) => validateFormInput(event.target, false));
    elem.addEventListener(`keyup`, (event) => validateFormInput(event.target, false));
    //    }
});

if (formInputs[0]) {
    //  The form submit event...
    document.querySelector(`#contact #submit`).addEventListener(`click`, (event) => validateForm(), false);
    //  The form reset button...
    document.querySelector(`#contact #reset`).addEventListener(`click`, (event) => clearForm(), false);
}


/*  ----------------
    End Listeners...
    ---------------- */

/*  ------------
    Functions...
    ------------ */

/*  ---------------------------------------------------------------
    Header logic:
        The header background should be transparent/translucent
        until the user scrolls the screen, then make it the regular
        background colour. This allows the main "hero" image to be
        unobstructed at the top until the user explores below.
    --------------------------------------------------------------- */
const toggleHeaderBG = () => {
    let smallVal = Number(getComputedStyle(headLogo).getPropertyValue(`--small-header-logo-multiplier`)) || .9;
    let largeVal = Number(getComputedStyle(headLogo).getPropertyValue(`--large-header-logo-multiplier`)) || 2;
    if (window.scrollY > headElem.offsetHeight) {
        headElem.classList.add(`header-stick`);
        headLogo.style.setProperty(`--header-logo-multiplier`, smallVal);
    } else {
        headElem.classList.remove(`header-stick`);
        if (headLogo) {
            headLogo.style.setProperty(`--header-logo-multiplier`, largeVal);
        }
    }
    return;
}
toggleHeaderBG();

/*  -----------------------------------------------------------------------------------
    Video logic...
    --------------
    Possible parameters include:
    forcePause (boolean):       is the calling function demanding the video pause;
    forcePlay (boolean):        is the calling function demanding the video play;
    intersectCall (boolean):    is the function being called by the IntersectionObserver;
    intersectVisible (boolean): when called by the observer, is the video visible;
    isClick (boolean):          is the function being called from a user click event;
    --------------
    Hierarchy when conflicts occur:
    Top:    user-paused -   if the element's data-user-paused = 1, wait until the user
                            clicks to resume play;
    2nd:    forcePause;
    3rd:    forcePlay;
    4th:    intersectCall = true & intersectVisible = false (pauses video);
    last:   click event (toggles current state)
    -----------------------------------------------------------------------------------
*/
function toggleVideoPause(vid, params) {
    let parNode = vid.parentNode;
    let useVid = parNode.querySelector(`video`);
    if (!useVid || useVid === `undefined`) { return; }
    let forcePause = (params.forcePause === undefined) ? false : params.forcePause;
    let forcePlay = (params.forcePlay === undefined) ? false : params.forcePlay;
    let intersectCall = (params.intersectCall === undefined) ? false : params.intersectCall;
    let vidVis = (params.intersectVisible === undefined) ? true : params.intersectVisible;
    let isClick = (params.isClick === undefined) ? true : params.isClick;
    if (intersectCall) { isClick = false; }
    let playVid = (useVid.dataset.userPaused === undefined) ? 1 : Math.abs(1 - Number(useVid.dataset.userPaused));
    playVid = !!+playVid;
    if (isClick) {
        playVid = !playVid;
    } else {
        playVid = true;
        if (intersectCall && !vidVis) { playVid = false; }
        if (forcePlay) { playVid = true; }
        if (forcePause) { playVid = false; }
        if (useVid.dataset.userPaused !== undefined && useVid.dataset.userPaused == 1) { playVid = false; }
    }
    //  Show overlay pause image only is video is visible... 
    let useOverlay = parNode.querySelector(`.hero-overlay`) || null;
    if (playVid) {
        useVid.play();
        if (useOverlay) { useOverlay.classList.remove(`paused`); }
    } else {
        useVid.pause();
        if (useOverlay) { useOverlay.classList.add(`paused`); }
    }
    if (isClick) { useVid.dataset.userPaused = Number(!playVid); }
    return;
}

/*  ----------------
    Send an email...
    ---------------- */

//  Set baseline contact email details...
const defaultToAddress = `monsmord@gmail.com`;
const defaultFromAddress = `rmcdonald.mailbox@gmail.com`;
const contactEmailSubject = `Avalon Adventures Contact Request`;
let contactEmailBody = `A question has been submitted on the Avalon Adventures website (${window.location.href}):\r`;

//  Send email...
function sendEmail(mailToAddress = defaultToAddress, mailFromAddress = defaultFromAddress, sendEmailSubj = contactEmailSubject, sendEmailBody = `Error - no email body`) {
    sendEmailBody = encodeURIComponent(sendEmailBody);
    window.open(`mailto:monsmord@gmail.com?subject=${sendEmailSubj}&body=${sendEmailBody}`);
    return;
}

/*  -----------------
    Form functions...
    ----------------- */

//  Add of remove an error message on a specified form input...
function toggleErrorMessage(errMsg = false, targElem = null, addRem = `remove`) {
    if (!targElem) { return; }
    if (addRem !== `add`) { addRem = `remove`; }
    if (!errMsg && addRem != `remove`) { return; }
    let checkErr = targElem.parentNode.querySelector(`span.warning`);
    if (addRem == `remove`) {
        if (checkErr) { checkErr.remove(); }
        return;
    }
    if (checkErr) { return; }
    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.slice(1);
    let errPara = document.createElement(`span`);
    errPara.className = `warning`;
    errPara.innerHTML = errMsg;
    if (targElem.type == `checkbox`) {
        targElem.parentNode.append(errPara);
    } else {
        targElem.parentNode.prepend(errPara);
    }
    return;
}

//  Validate form inputs (except phone)...
function validateFormInput(inputElem = null, submitTF = false, clearError = false) {
    //  Make sure inputElem argument is a recognized input or textarea element...
    if (!(inputElem instanceof Element || inputElem instanceof HTMLElement)) {
        //        console.log(inputElem);
        return;
    }
    //  Set variables based on specific input names...
    let errMsg = `There is a problem with your entry...`;
    let checkRegex = [], minLength = 0, isCheckBox = false;
    let inputVal = inputElem.value.toString().trim();
    let reqd = inputElem.hasAttribute(`required`), removeErr = `remove`;
    switch (inputElem.name) {
        case `contactname`:
            minLength = 2;
            errMsg = `Names must be at least ${minLength} characters long and contain only letters, spaces, periods, dashes, and apostrophes...`;
            checkRegex = [/^[\A-Za-z\-. ``]+$/];
            break;
        case `contactemail`:
            errMsg = `Invalid email address...`;
            minLength = 5;
            //  The following strict regex throws "too much recurcsion" errors in Firefox:
            //  checkRegex = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/];
            //  A more persmissive regex has been added...
            checkRegex = [/^[^\s@]+@[^\s@]+\.[^\s@]+$/];
            break;
        case `contactphone`:
            errMsg = `Invalid phone number...`;
            minLength = 6;
            checkRegex = [
                /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/, // standard 10-digit North American format...
                /^\+(?:[0-9] ?){6,14}[0-9]$/, //  ITU-T E.123 international phone number notation (see https://www.itu.int/rec/T-REC-E.123-200102-I/en)...
                /^\+[0-9]{1,3}\.[0-9]{4,14}(?:x.+)?$/]; //  Extensible Provisioning Protocol international phone number notation (see https://datatracker.ietf.org/doc/html/rfc5733#section-2.5)...
            break;
        case `contactquestion`:
            errMsg = `Please enter a question...`;
            minLength = 5;
            break;
        default:
            if (inputElem.type == `checkbox` && reqd && !inputElem.checked && submitTF && !clearError) {
                errMsg = `Check required...`;
                removeErr = `add`;
                isCheckBox = true;
            } else {
                return;
            }
    }
    //  If the input value fails the length or regex check, add the error message to the DOM...
    let altErrMsg = inputElem.dataset.nicetext || ``;
    altErrMsg = altErrMsg.toString().trim();
    if (!isCheckBox) {
        if (inputVal.length < minLength) {
            removeErr = `add`;
            if (inputVal.length == 0 && reqd && submitTF && altErrMsg.length > 0) {
                errMsg = `${altErrMsg} is required...`;
            }
        } else {
            if (checkRegex.length > 0) {
                removeErr = `add`;
                for (let a = 0; a < checkRegex.length; a++) {
                    if (inputVal.match(checkRegex[a])) {
                        removeErr = `remove`;
                        break;
                    }
                }
            }
        }
        console.log(inputElem.name, inputVal, checkRegex.length);
        //  If the input value is blank, and is not required or the form is not being submitted,
        //  remove any existing error message from the DOM...
        if (inputVal.length < minLength && (!submitTF || !reqd)) {
            //  If the form is being submitted and the value is too short, clear it...
            if (submitTF && !reqd) { inputElem.value = ``; }
            removeErr = `remove`;
        }
    }
    //  If clearError is TRUE and submitTF is FALSE, clear any error...
    if (clearError == true && !submitTF) { removeErr = `remove`; }
    if (removeErr != `add`) { errMsg = false; }
    toggleErrorMessage(errMsg, inputElem, removeErr);
    return errMsg;
}

function validateForm() {
    //  Validate all form fields...
    let errs = [];
    formInputs.forEach(elem => {
        let errMsg = validateFormInput(elem, true)
        if (errMsg) { errs.push(errMsg); }
    });
    //  If there are unresolved errors, inform the user and exit...
    if (errs.length > 0) {
        return;
    }
    //  Serialize the form data and email the results...
    let emailBody = contactEmailBody;
    let contactForm = document.querySelector(`#contact`);
    let data = new FormData(contactForm);
    let didLegend = false, tryLegend = 0, tabChar = ``;
    for (let datapoint of data) {
        let key = datapoint[0], value = datapoint[1];
        let inputElem = document.getElementById(key);
        let niceName = inputElem.dataset.formkey || key;
        //  Get legend text from the fieldset where the checkbox resides...
        if (inputElem.type == `checkbox`) {
            if (!didLegend) {
                let checkParent = inputElem;
                while (!didLegend && tryLegend < 4) {
                    checkParent = checkParent.parentElement;
                    tryLegend++;
                    if (checkParent.tagName !== `FIELDSET`) {
                        continue;
                    }
                    didLegend = true;
                    let legendElem = checkParent.querySelector(`legend`);
                    if (!legendElem) { break; }
                    let legendText = legendElem.innerHTML.toString().trim() || ``;
                    if (legendText.length > 0) {
                        emailBody += `\r\r${legendText}\r`;
                        tabChar = `\t`;
                    }
                    break;
                }
            }
            emailBody += `${tabChar}${value}\r`;
        } else {
            emailBody += `\r${niceName}: ${value}`;
        }
    }
    sendEmail(undefined, undefined, undefined, emailBody);
    //  Reset the form...
    clearForm();
    return;
}

function clearForm() {
    formInputs.forEach(elem => {
        if (elem.type == `checkbox`) {
            elem.checked = false;
        } else {
            elem.value = ``;
        }
        validateFormInput(elem, false, true);
    });
    return;
}

/*  --------------------------
    Miscellaneous functions...
    -------------------------- */

/*  --------------------------------------------------------------------------
/*  Sets the proper size/aspect ratio of elements with the "polaroid" class...
    --------------------------------------------------------------------------
    Polaroid photo "frames" need to maintain an outer aspect ratio of 35/42
    (3.5 inches/4.2 inches), an image aspect ratio of 1/1, and margins of 2 units
    on the top, left, and right.
    
    Calculations are based on the element's current total width (offsetWidth),
    as set by the polaroid class. The function sets the element.width and .height
    such that the borders fall within the desired width and the height is
    appropriately set to match the aspect ratio.

    The image within the polaroid "frame" is expected to be "before" content.

    If the element possesses the "data-polaroid-caption" attribute, the font size
    is calculated to fit the entire message in the larger bottom border area.

    Called on initial page load and on window resizing...
*/
function polaroidSetSize(pol = null) {
    if (!pol || !(pol instanceof HTMLElement) || !pol.classList.contains(`polaroid`)) { return; }
    let x = pol.offsetWidth;
    let y = (x / 35) * 42, b = (x / 35) * 2;
    pol.width = pol.height = x - (b * 2);
    let botBord = (y - pol.width) - b;
    pol.style.border = `${b}px solid white`;
    pol.style.borderBottom = `${botBord}px solid white`;
    //  Do any caption text...
    let capText = pol.dataset.polaroidCaption || "";
    if (!capText || capText.length < 1) { return; }
    let fontSize = textFitter(capText, pol.width, botBord - (b * 2), ``, pol) || 6;
    pol.style.setProperty(`--caption-font-size`, `${fontSize}px`);
    pol.style.lineHeight = (1.5 * fontSize) + `px`;
    return;
}

//  Return size of text that will fit an element or given space...
function textFitter(txt = ``, wide = 0, high = 0, fontFam = ``, elemCheck = null) {
    txt = txt.toString(), elemUse = null, wh = null;
    if (txt.length < 1) { return 0; }
    fontFam = fontFam.toString();
    if (elemCheck instanceof HTMLElement) { elemUse = elemCheck; }
    let w = wide || 0, h = high || 0;
    if (typeof w != `number` || w < 1) { w = 0; }
    if (typeof h != `number` || h < 1) { h = 0; }
    //  If an element is passed and wide or high are < 1, or fontFam is not provided,
    //  get the missing parameter(s) from the element's content area...
    if ((w == 0 || h == 0 || !fontFam) && elemUse) {
        wh = getElemSize(elemUse, { "type": "content" });
        if (w < 1) { w = wh[0] || 0; }
        if (h < 1) { h = wh[1] || 0; }
        if (fontFam.length < 1) { fontFam = wh[2].fontFamily; }
    }
    if (w < 1 || h < 1) { return 0; }
    //  Create a test <p> element of the specified size...
    let tempPar = document.createElement(`p`);
    tempPar.style.display = `block`, tempPar.style.padding = 0, tempPar.style.border = `none`;
    tempPar.style = `width: ${w}px !important; height: ${h}px !important; overflow="hidden"`;
    if (fontFam.length > 0) { tempPar.style.fontFamily = fontFam; }
    let tempID = Date.now();
    tempPar.setAttribute(`id`, tempID);
    tempPar.innerHTML = txt;
    document.body.append(tempPar);
    let fs = 2;
    //  Step through font sizes until the <p> overflows...
    while (fs <= 80) {
        tempPar.style.fontSize = `${fs}px`;
        if (tempPar.scrollHeight > tempPar.clientHeight) { break; }
        if (tempPar.scrollWidth > tempPar.clientWidth) { break; }
        fs++;
    }
    if (txt[0] == '<') { console.log(txt, w, h, fs); }
    //    console.log(fs, wh, w, wide, h, high, fontFam);
    tempPar.remove();
    return Math.max(fs, 4);
}

function toggleHamburgerMenu() {
    const menuButton = document.getElementById(`hamburger-menu`);
    const scrollDownButton = document.getElementById(`scroll-to-bottom`);
    const scrollUpButton = document.getElementById(`scroll-to-top`);
    const navMenu = document.getElementById(`site-nav`);
    if (!menuButton || !navMenu) { return; }
    if (menuButton.classList.contains(`hamburger`)) {
        menuButton.classList.remove(`hamburger`);
        menuButton.classList.add(`closeX`);
        headElem.style.height = `100vh`;
        headElem.classList.add(`header-stick`)
        navMenu.style.display = `block`;
        scrollDownButton.classList.add(`disappear`);
        scrollUpButton.classList.add(`disappear`);
        document.body.classList.add(`noscroll`);
    } else {
        menuButton.classList.remove(`closeX`);
        menuButton.classList.add(`hamburger`);
        headElem.style.height = `var(--header-height)`;
        headElem.classList.remove(`header-stick`)
        toggleHeaderBG();
        navMenu.style.display = `none`;
        scrollDownButton.classList.remove(`disappear`);
        scrollUpButton.classList.remove(`disappear`);
        document.body.classList.remove(`noscroll`);
    }
    return;
}

/*  ---------------------------------------------------------------------------------
    Adds a "data-polaroid-caption" value to all "polaroid" elements that also contain
    the "media-caption" class. The value is drawn from the --citation-text variable
    of the background image of the element. This allows the media.css sheet to be the
    sole warehouse of images and their sources...
    --------------------------------------------------------------------------------- */
function updateMediaCaptions() {
    let captPols = document.querySelectorAll(`.polaroid.media-citation`);
    captPols.forEach(elem => {
        let captTxt = getComputedStyle(elem).getPropertyValue(`--citation-text`) || ``;
        captTxt = captTxt.replaceAll(`"`, ``).trim();
        if (captTxt.length < 1) {
            captTxt = [`Unknown`, `Uncertain`, `???`][Math.floor(Math.random() * 3)];
        }
        if (captTxt.indexOf(`,`) >= 0) {
            captTxt = captTxt.split(`,`);
            let c = captTxt.shift();
            captTxt = captTxt.toString().trim();
        }
        elem.dataset.polaroidCaption = captTxt;
    })
    return;
}

//  Create a downloadable text file of information in the DOM...
function collectDocumentData(infoType = `class`) {
    let everyElem = document.querySelectorAll(`*`), allClasses = [], myClasses = null;
    everyElem.forEach((elem) => {
        switch (infoType) {
            case `class`:
                if (elem.classList) {
                    myClasses = elem.classList || null;
                    if (myClasses.length) {
                        allClasses.push(...myClasses);
                    }
                }
                break;
            case `id`:
                if (elem.id) {
                    allClasses.push(elem.id);
                }
                break;
            default: return;
        }
    });
    let uniqueClasses = [...new Set(allClasses.sort())];
    let textData = uniqueClasses.join(`\n`);
    let textFile = null, makeTextFile = function (text) {
        var data = new Blob([text], { type: `text/plain` });
        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
            window.URL.revokeObjectURL(textFile);
        }
        textFile = window.URL.createObjectURL(data);
        // returns a URL you can use as a href
        console.log(textFile);
        return textFile;
    };
    let textFileName = window.location.pathname.split(`/`).pop().replaceAll(`.`, `-`) + `-${infoType}.txt`;
    let a = document.createElement(`a`);
    a.title = `Document Research`;
    var linkText = document.createTextNode(a.title);
    a.appendChild(linkText);
    a.href = makeTextFile(textData);
    a.style.display = `block`;
    a.style.fontSize = `3em`;
    a.setAttribute(`download`, textFileName);
    let main = document.getElementsByTagName(`main`)[0];
    main.appendChild(a);
    return;
}
//collectDocumentData();

//  Scrolling shortcut buttons...
function greyScrollButtons() {
    let bodHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight
    );
    let totalHeight = Math.max(window.innerHeight, bodHeight);
    let whereScroll = Math.min(Math.max(window.scrollY / totalHeight, .1), 1);
    if (scrollDownButton) {
        scrollDownButton.style.opacity = 1 - whereScroll;
        if (scrollDownButton.style.opacity < .3) {
            scrollDownButton.style.pointerEvents = `none`;
        } else {
            scrollDownButton.style.pointerEvents = `auto`;
        }
    }
    if (scrollUpButton) {
        scrollUpButton.style.opacity = whereScroll;
        if (scrollUpButton.style.opacity < .3) {
            scrollUpButton.style.pointerEvents = `none`;
        } else {
            scrollUpButton.style.pointerEvents = `auto`;
        }
    }
    return;
}
greyScrollButtons();

function scrollToBottom() {
    window.scroll(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
    return;
}

function scrollToTop() {
    window.scroll(0, 0);
    return;
}

/*  Get an element or pseudo-element's width & height...
    "args" is an associative array:
        "type":     string of what size to return:
                    "content":  the content w/o padding or border;
                    "padding":  content and padding;
                    "all":      content, padding, and border (offsetWidth/Height)
        "pseudo":   a pseudo-element passed as a string (optional);
    The function returns an array of [width, height, computedStyle], or false on error; */
function getElemSize(elem, args) {
    let comped = getComputedStyle(elem);
    if (!comped) { return false; }
    let retArr = [parseFloat(comped.width.replace(`px`, ``)), parseFloat(comped.height.replace(`px`, ``)), comped];
    if (args.type == `all`) {
        return retArr;
    }
    retArr[0] -= (parseFloat(comped.marginLeft.replace(`px`, ``)) + parseFloat(comped.marginRight.replace(`px`, ``)));
    retArr[1] -= (parseFloat(comped.marginTop.replace(`px`, ``)) + parseFloat(comped.marginBottom.replace(`px`, ``)));
    if (args.type == `padding`) {
        return retArr;
    }
    retArr[0] -= (parseFloat(comped.paddingLeft.replace(`px`, ``)) + parseFloat(comped.paddingRight.replace(`px`, ``)));
    retArr[1] -= (parseFloat(comped.paddingTop.replace(`px`, ``)) + parseFloat(comped.paddingBottom.replace(`px`, ``)));
    return retArr;
}

function toggleFullscreen(elem) {
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch((err) => {
            console.log(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,);
            return true;
        });
    } else {
        document.exitFullscreen();
    }
    return false;
}
