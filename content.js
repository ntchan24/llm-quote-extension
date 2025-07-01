if (window.llmQuoteReplyLoaded) {
    // Script already injected, do not run again.
} else {
    window.llmQuoteReplyLoaded = true;

    console.log("LLM Quote Reply content script loaded.");

    const sites = {
        "claude.ai": {
            "input": "div[contenteditable='true'].ProseMirror",
            "responseContainer": ".font-claude-message" 
        },
        "chat.deepseek.com": {
            "input": "textarea#chat-input",
            "responseContainer": ".ds-markdown, .fbb737a4"
        },
        "grok.x.ai": {
            "input": "textarea[aria-label='Ask Grok anything']",
            "responseContainer": ".response-content-markdown"
        },
        "chat.openai.com": {
            "input": "#prompt-textarea",
            "responseContainer": "[role='presentation']"
        }
    };

    let quoteButton = null;

    function getSite() {
        for (const site in sites) {
            if (window.location.hostname.includes(site)) {
                return sites[site];
            }
        }
        return null;
    }

    function showQuoteButton(x, y, selectedText) {
        if (!quoteButton) {
            quoteButton = document.createElement('button');
            quoteButton.id = 'llm-quote-button';
            quoteButton.textContent = 'Quote';
            document.body.appendChild(quoteButton);

            quoteButton.addEventListener('click', () => {
                const textToQuote = quoteButton._textToQuote;
                if (textToQuote) {
                    const siteConfig = getSite();
                    if (siteConfig) {
                        const inputArea = document.querySelector(siteConfig.input);
                        if (inputArea) {
                            const quotedLines = textToQuote.trim().split('\n').map(line => `> ${line}`);

                            if(siteConfig.input.includes("div[contenteditable='true']")){
                                inputArea.focus();
                                const selection = window.getSelection();
                                selection.selectAllChildren(inputArea);
                                selection.collapseToEnd();
                                const range = selection.getRangeAt(0);

                                const fragment = document.createDocumentFragment();
                                if (inputArea.textContent.trim().length > 0) {
                                    fragment.appendChild(document.createElement('br'));
                                    fragment.appendChild(document.createElement('br'));
                                }
                                for (let i = 0; i < quotedLines.length; i++) {
                                    fragment.appendChild(document.createTextNode(quotedLines[i]));
                                    if (i < quotedLines.length - 1) {
                                        fragment.appendChild(document.createElement('br'));
                                    }
                                }
                                fragment.appendChild(document.createElement('br'));
                                fragment.appendChild(document.createElement('br'));
                                range.insertNode(fragment);
                                selection.collapseToEnd();
                            } else {
                                const quotedText = quotedLines.join('\n');
                                const prefix = inputArea.value.trim().length > 0 ? '\n\n' : '';
                                const finalText = prefix + quotedText + '\n\n';
                                
                                inputArea.value += finalText;
                                inputArea.focus();
                                inputArea.selectionStart = inputArea.selectionEnd = inputArea.value.length;
                                
                                // Dispatch an input event to notify the site of the change
                                const inputEvent = new Event('input', { bubbles: true });
                                inputArea.dispatchEvent(inputEvent);
                            }
                        }
                    }
                }
                hideQuoteButton();
            });
        }
        quoteButton._textToQuote = selectedText;
        quoteButton.style.left = `${x}px`;
        quoteButton.style.top = `${y}px`;
        quoteButton.style.display = 'block';
    }

    function hideQuoteButton() {
        if (quoteButton) {
            quoteButton.style.display = 'none';
            quoteButton._textToQuote = '';
        }
    }

    document.addEventListener('mouseup', (e) => {
        const siteConfig = getSite();
        if (!siteConfig) return;

        if (window.location.hostname.includes('grok')) {
            console.log('[Quote] Mouseup event detected.');
        }

        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (selectedText.length > 0) {
            if (window.location.hostname.includes('grok')) {
                console.log(`[Quote] Selected text: "${selectedText.substring(0, 50)}..."`);
            }
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const elementContainer = container.nodeType === Node.TEXT_NODE ? container.parentElement : container;

            if (window.location.hostname.includes('grok')) {
                console.log('[Quote] Container element:', elementContainer);
            }

            if (elementContainer) {
                const messageBlock = elementContainer.closest(siteConfig.responseContainer);
                 if (window.location.hostname.includes('grok')) {
                    console.log(`[Quote] Searching for selector: "${siteConfig.responseContainer}"`);
                    console.log('[Quote] Found message block:', messageBlock);
                }
                if (messageBlock) {
                    const inputArea = document.querySelector(siteConfig.input);
                    if (!inputArea || !inputArea.contains(selection.getRangeAt(0).commonAncestorContainer)) {
                        if (window.location.hostname.includes('grok')) {
                            console.log('[Quote] All checks passed. Showing button.');
                        }
                        showQuoteButton(e.pageX, e.pageY, selectedText);
                    } else {
                         if (window.location.hostname.includes('grok')) {
                            console.log('[Quote] Selection is inside the input area. Aborting.');
                        }
                    }
                }
            }
        } else {
            if (quoteButton && e.target.id !== 'llm-quote-button') {
                hideQuoteButton();
            }
        }
    }, true);

    // Hide button on scroll
    document.addEventListener('scroll', hideQuoteButton, true);
} 