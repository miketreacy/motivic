<script></script>
<footer>
    <div class="social">
        <a href="https://github.com/miketreacy/motivic" target="_blank">
            <span class="social-icon" id="github"></span>
        </a>
        <a href="https://twitter.com/mstreacy" target="_blank">
            <span class="social-icon" id="twitter"></span>
        </a>
    </div>
</footer>

<style>
    footer {
        box-sizing: border-box;
        display: flex;
        background-color: var(--theme_color_4);
        position: fixed;
        width: 100vw;
        z-index: var(--middle);
        padding: 10px;
        flex-direction: column;
        min-width: inherit;
        border-top: 2px solid var(--theme_color_1);
        bottom: 0;
    }

    .scrollup footer {
        display: none;
    }

    .social {
        padding: 0;
    }

    .social-icon {
        height: 32px;
        width: 32px;
        display: block;
        margin: 0 10px
    }

    #github {
        background-image: url('/images/GitHub-Mark-32px.png');
    }

    #twitter {
        background-image: url('/images/Twitter_Social_Icon_Circle_Color.svg');
    }
</style>