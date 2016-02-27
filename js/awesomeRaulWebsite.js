function awesomeRaulWebsite() {
    var $nav;
    var $webNavPanel;
    var webNavPanelLinks;
    var self = this;

    /*****************************************************************************************************************/
    /** Public methods                                                                                              **/
    /*****************************************************************************************************************/

    /**
     * Receives "a" elements and adds a smooth scrolling to them.
     * Note: speed / moving_frequency must return an integer number, otherwise does not works properly.
     * @param links
     */
    this.enableSmoothScrolling = function (links) {
        var speed = 500;
        var moving_frequency = 25; // Affects performance !
        var href;
        for (var i = 0; i < links.length; i++) {
            href = (typeof(links[i].attributes.href) == 'undefined') ? null : links[i].attributes.href.nodeValue.toString();
            if (href !== null && href.length > 1 && href.substr(0, 1) == '#') {
                links[i].onclick = function () {
                    var element;
                    var href = this.attributes.href.nodeValue.toString();
                    if (element = document.getElementById(href.substr(1))) {
                        var hop_count = speed / moving_frequency;
                        var getScrollTopDocumentAtBegin = getScrollTopDocument();
                        var gap = (getScrollTopElement(element) - getScrollTopDocumentAtBegin) / hop_count;
                        for (var i = 1; i <= hop_count; i++) {
                            (function () {
                                var hop_top_position = gap * i;
                                setTimeout(function () {
					var scrollPosition = hop_top_position + getScrollTopDocumentAtBegin
					$('html, body').animate({
            					scrollTop: scrollPosition
			        	}, 20);
                                }, moving_frequency * i);
                            })();
                        }
                    }

                    return false;
                };
            }
        }

        var getScrollTopElement = function (e) {
            var top = 0;

            while (typeof(e.offsetParent) != 'undefined' && e.offsetParent != null) {
                top += e.offsetTop + (e.clientTop != null ? e.clientTop : 0);
                e = e.offsetParent;
            }

            return top;
        };

        var getScrollTopDocument = function () {
            return document.documentElement.scrollTop + document.body.scrollTop;
        };
    };

    this.toggleWebNavOnClick = function (element) {
        element.click(function () {
            $webNavPanel.slideToggle();
        });
    };

    this.openProject = function ($project) {
        $project.addClass('shown');
    };

    this.closeProject = function ($project) {
        $project.addClass('hide');
        setTimeout(function () {
            $project.removeClass('shown');
            $project.removeClass('hide');
        }, 990);
    };

    this.contactMessage = function (message) {
        var $displayer = jQuery('#contactAnswerDisplayer');
        $displayer.html(message);
    };

    /*****************************************************************************************************************/
    /** Site construction                                                                                           **/
    /*****************************************************************************************************************/

    try {
        jQuery(document).ready(function () {
            // Validate
            validate();

            // Initializing website scripts
            initialize();
        });
    }
    catch (error) {
        displayError(error);
    }

    /*****************************************************************************************************************/
    /** Private methods                                                                                             **/
    /*****************************************************************************************************************/

    function validate() {
        $nav = jQuery('nav');
        $webNavPanel = jQuery('#webNavPanel');
        webNavPanelLinks = $webNavPanel.find('a');

        if ($nav == 'undefined' || !($nav instanceof jQuery)) {
            throw 'Nav element expected to be jQuery object. Undefined instead.';
        }
        if ($webNavPanel == 'undefined' || !($webNavPanel instanceof jQuery)) {
            throw 'Web navigation element expected to be jQuery object. Undefined instead.';
        }
        if (webNavPanelLinks == 'undefined' || !(webNavPanelLinks instanceof jQuery)) {
            throw 'Panel links expected to be jQuery objects. Undefined instead.';
        }
    }

    /**
     * Inits event listeners.
     * Makes some links' scrolling smooth.
     */
    function initialize() {
        /**
         * The nav button triggers the showing and the closing of the web navigation panel.
         */
        self.toggleWebNavOnClick($nav.find('.button'));
        self.enableSmoothScrolling($nav.find('a'));

        /**
         * When clicking any link in the web navigation panel, this panel has to close.
         */
        self.toggleWebNavOnClick(webNavPanelLinks);
        self.enableSmoothScrolling(webNavPanelLinks);

        /**
         * Showing off with the amazing title!
         */
        // Get the three elements
        var titles = jQuery('#mainHeader').find('.title');

        var lastEffect = function () {
            setTimeout(
                function () {
                    jQuery(titles[2]).letterfx({"fx": "smear", "words": true, "timing": 300});
                }, 1000
            );
        };
        var secondEffect = function () {
            jQuery(titles[1]).letterfx({"fx": "smear", "words": true, "timing": 300, onElementComplete: lastEffect});
        };

        jQuery(titles[0]).letterfx({"fx": "smear", "words": true, "timing": 300, onElementComplete: secondEffect});

        /**
         * Adding event listener - scroll, so when hidden stuff must be displayed, they do so!
         */
        jQuery(window).scroll(function () {
            var topOfWindow = jQuery(window).scrollTop();

            $('.hiddenIfUnscrolled').each(function () {
                var imagePos = jQuery(this).offset().top;
                if (imagePos < topOfWindow + 700) {
                    jQuery(this).addClass("scrolledElement");
                }
            });
        });

        /**
         * Project Window events
         */
        // Getting project links
        var projectList = jQuery('#projectContainer').find('.project');

        // Attaching event listeners
        projectList.click(function () {
            self.openProject(jQuery('#projectWindow_' + jQuery(this).attr('id')));
        });

        // Closing project window
        jQuery('.close').click(function () {
            self.closeProject(jQuery(this).closest('.projectWindow'));
        });
        jQuery('.overlay').click(function () {
            self.closeProject(jQuery(this).closest('.projectWindow'));
        });

        // Contact form submission
        jQuery('#buttonForm').click(function () {
            // Getting parameters
            var name = jQuery('#nameInput').val();
            var mail = jQuery('#mailInput').val();
            var message = jQuery('#messageInput').val();

            // Basic validations
            if (
                name == '' ||
                    mail == '' ||
                    message == ''
                ) {
                self.contactMessage('Please specify a name, a mail and a message.');
                return;
            }

            // Sending to server
            jQuery.ajax({
                type: 'post',
                url: 'contact',
                data: {
                    name: name,
                    mail: mail,
                    message: message
                }
            }).done(function (rawResponse) {
                    try {
                        var response = jQuery.parseJSON(rawResponse);
                    } catch (err) {
                        self.contactMessage('Oh, this is embarrassing. Failed to send the message. Can you try by mail?');
                        return;
                    }
                    self.contactMessage(response[1]);
                }
            ).fail(function (response) {
                    self.contactMessage(response.statusText);
                }
            );
        });
    }

    function displayError(msg) {
        console.error('Received error while initializing website: ' + msg);
    }
}

new awesomeRaulWebsite();
