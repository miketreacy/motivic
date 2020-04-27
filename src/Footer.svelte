<script>
    export let scrollUp = false
</script>

<style>
    footer {
        box-sizing: border-box;
        display: flex;
        z-index: var(--middle);
        background-color: var(--theme_color_4);
        position: fixed;
        width: 100vw;
        z-index: var(--middle);
        padding: 10px;
        flex-direction: column;
        min-width: inherit;
        bottom: 0;
    }

    footer.scrollup {
        display: none;
    }

    .social {
        padding: 0;
    }

    .social-icon {
        height: 32px;
        width: 32px;
        margin: 0 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: var(--theme_font_size_3);
    }

    #github {
        background-image: url('/images/github_icon.png');
    }

    #twitter {
        background-image: url('/images/twitter_icon.svg');
    }
    /*Desktop*/
    @media (min-width: 1025px) {
        footer.scrollup {
            display: flex;
        }
    }
</style>

<footer class:scrollup={scrollUp}>
    <div class="social">
        <!-- <a
      href="https://github.com/miketreacy/motivic"
      target="_blank"
      rel="noopener noreferrer">
      <span class="social-icon" id="github" />
    </a> -->
        <a
            href="https://twitter.com/mstreacy"
            target="_blank"
            rel="noopener noreferrer"
            title="contact me">
            <span class="social-icon" id="twitter" />
        </a>
        <!-- TODO: commenting out for now because the redirect to the google form isn't working -->
        <!-- <a href="/feedback" rel="noopener noreferrer" title="user feedback">
            <span class="social-icon" id="feedback">✍</span>
        </a> -->

    </div>
</footer>
