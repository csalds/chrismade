var iOS = false;

// the currently displayed generic popup, or null if none displayed.
var currentPopup = null;
var currentGenericPopupContents = null; // VERIFY WE CAN REMOVE

// the currently displayed full-screen popup, or none if none displayed
var currentFullscreenPopup = null;

$(document).ready(function () {

    $('.img-container a').each(function () {
        $(this).attr({
            'data-link-target': "fullscreenImage",
            'data-fullscreen-image-src': $(this).find('img').attr('src')
        });
    });

    // initialize click handlers
    setClickHandlers(document);

    $('.sidenav-item').click(function(){
        $('.sidenav-item').removeClass('current-article');
        $(this).addClass('current-article');
        var currentArticle = $(this).attr('id');
        $('.article').css('display','none');
        $('#' + currentArticle + '-article').css('display','block');
    });
});



function sizeViewer() {

    var winWidth = $(window).width();
    var winHeight = $(window).height() - 20;

    $('#popup-image-viewer #popup-image-viewer-content, #popup-video-viewer #popup-video-viewer-content').css({
        'width': winWidth,
        'height': winHeight
    });
    $('#popup-image-viewer #imagecontent, #popup-video-viewer #videocontent').css({
        'max-width': winWidth,
        'max-height': winHeight
    });

}


/**
 * Sets click handlers on an element / document
 */
function setClickHandlers(elem) {
    // handle touch handlers on mobile different from ordinary click handlers on desktop, in order to avoid double-events on iPad

    $(elem).find('[data-link-target]').on('click', handleDataLinkTargetClick);

}

/**
 * Handles a click on an item with a data-link-target attribute.
 * Prevents double-clicks.
 */
var currentClickTimer = null;

function handleDataLinkTargetClick() {
    var elemObj = $(this);

    if (currentClickTimer == null) {
        currentClickTimer = setTimeout(function () {
            triggerDataLinkTarget(elemObj);
            currentClickTimer = null;
        }, 10); // trigger after 10ms = 0.01s
    }
}

/**
 * Handles the triggering of an item with a data-link-target attribute.
 */
function triggerDataLinkTarget(elem) {
    $elemObj = $(elem);

    $target = $elemObj.data('linkTarget');

    $action = $elemObj.data('linkAction');
    if (($action == null) && ($target != null)) {
        $idx = $target.indexOf('-');
        if ($idx < 0) {
            $action = $target;
        } else {
            $action = $target.substr(0, $idx);
        }
        $elemObj.data('linkAction', $action);
    }

    //console.log('$action: ' + $action + ', $target: ' + $target);

    switch ($action) {
        case 'fullscreenImage':
            showFullscreenImage($elemObj.data());
            break;
        case 'fullscreenVideo':
            showFullscreenVideo($elemObj.data());
            break;
        case 'video':
            if (iOS) {
                window.location.assign('portfolio:showMovie:' + $target + '.m4v');
            } else {
                showFullscreenVideo($elemObj.data());
            }
            break;
        case 'closePopup':
            closeDialog();
            break;
        case 'closeFullscreenPopup':
            closeFullscreenDialog();
            break;
        case 'showResume':
            showResume();
            break;
        case 'scrollDown':
            scrollDown();
            break;
        case 'externalLink':
            break;
        default:
            break;
    }
}

/**
 * show fullscreen image
 */
function showFullscreenImage(imageData) {

    //ga('send', 'event', 'portfolio', 'open', imageData.fullscreenImageSrc);

    $('#imagecontent').attr('src', '').attr('src', imageData.fullscreenImageSrc);
    popupFullscreenDialog('popup-image-viewer');

}

function showFullscreenVideo(imageData) {
    //ga('send', 'event', 'portfolio', 'watch', imageData.linkTarget);

    var vid = 'video/' + imageData.linkTarget;

    /*
	$('#src-mp4').attr('src', '').attr('src', vid + '.mp4');
	$('#src-ogg').attr('src', '').attr('src', vid + '.ogv');
	$('#src-webm').attr('src', '').attr('src', vid + '.webm');
	*/

    var vidHtml;

    if (Modernizr.video) {
        // let's play some video!
        vidHtml = '<video id="videocontent" controls width="1024" data-link-target="">' +
            '<source id="src-mp4" src="' + vid + '.mp4" type="video/mp4"></source>' +
            '<source id="src-ogg" src="' + vid + '.ogv" type="video/ogg"></source>' +
            '<source id="src-webm" src="' + vid + '.webm" type="video/webm"></source>' +
            '</video>';
    } else {
        vidHtml = '<object type="video/x-ms-wmv" data="' + vid + '.wmv" width="640" height="522">' +
            '<param name="src" value="' + vid + '.wmv" />' +
            '<param name="controller" value="true" />' +
            '<param name="autostart" value="true" />' +
            '</object>';
    }

    $('#popup-video-viewer-content').html(vidHtml);

    $('#videocontent').on('click', handleDataLinkTargetClick);

    sizeViewer();

    popupFullscreenDialog('popup-video-viewer');
}

/**
 * popup the fullscreen dialog with id 'dialogId'
 *
 * @param fullscreenDialogId	the dialog to show
 * @param completeCallback		callback for completion of dialog fading in.  May be null.
 */
function popupFullscreenDialog(fullscreenDialogId, completeCallback) {
    try {
        if (currentFullscreenPopup != null) {
            closeFullscreenDialog(currentFullscreenPopup);
        }

        $('#overlay').fadeIn();
        $('#' + fullscreenDialogId).fadeIn({
            complete: completeCallback
        });
        currentFullscreenPopup = fullscreenDialogId;
        $('#' + fullscreenDialogId).focus();
        
        $(document).on('keydown', function(e) {
            if(e.key === "Escape" || e.key == 27) {
                closeFullscreenDialog(fullscreenDialogId);
              return; 
            }

          });

    } catch (err) {
        console.log(err);
    }
}



/**
 * close the dialog with id 'dialogId'
 *
 * @param dialogId		the dialog to hide
 */
function closeFullscreenDialog(fullscreenDialogId) {
    try {
        if (fullscreenDialogId == null) {
            fullscreenDialogId = currentFullscreenPopup;
        }

        $('#' + fullscreenDialogId).fadeOut();

        if (currentFullscreenPopup == fullscreenDialogId) {
            currentFullscreenPopup = null;
        }
        $('#overlay').fadeOut();
    } catch (err) {
        console.log(err);
    }
}