    (() => {

      "use strict";


      /* =====================================================
         CONFIGURATION
         ====================================================== */

      const AGE_CONFIG = {

        /*
         * Change this key if you ever want to invalidate
         * previously stored visitor choices.
         *
         * Example:
         * "miichika-age-v2"
         */
        storageKey: "miichika_age_configuration_v1",

        /*
         * Countdown duration.
         */
        countdownSeconds: 5,

        /*
         * Default when visitor doesn't click anything.
         */
        defaultAge: "G"

      };


      /* =====================================================
         ELEMENTS
         ====================================================== */

      const overlay =
        document.getElementById("ageOverlay");

      const timer =
        document.getElementById("ageTimer");

      const yesButton =
        document.getElementById("ageYesButton");

      const noButton =
        document.getElementById("ageNoButton");

      const changeButton =
        document.getElementById("changeAgeButton");

      const statusText =
        document.getElementById("ageStatusText");


      /* =====================================================
         STATE
         ====================================================== */

      let countdown = null;

      let remaining =
        AGE_CONFIG.countdownSeconds;


      /* =====================================================
         STORAGE
         ====================================================== */

      function getSavedAge() {

        try {

          return localStorage.getItem(
            AGE_CONFIG.storageKey
          );

        } catch (error) {

          /*
           * localStorage can be disabled by the browser.
           * In that case, simply behave as if there
           * is no saved configuration.
           */

          return null;
        }
      }


      function saveAge(age) {

        try {

          localStorage.setItem(
            AGE_CONFIG.storageKey,
            age
          );

        } catch (error) {

          /*
           * Ignore storage failures.
           */
        }
      }


      /* =====================================================
         APPLY AGE MODE
         ====================================================== */

      function applyAgeMode(age) {

        /*
         * Anything other than explicit 21+ approval
         * is treated as G.
         */

        const isAdult =
          age === "21+";


        if (isAdult) {

          document.body.classList.add(
            "age-ao-approved"
          );

          statusText.textContent = "21+";

        } else {

          document.body.classList.remove(
            "age-ao-approved"
          );

          statusText.textContent = "G";
        }


        /*
         * Explicitly hide AO content when not approved.
         *
         * This is useful even if CSS gets changed later.
         */

        document
          .querySelectorAll('[data-rating="AO"]')
          .forEach(element => {

            element.hidden = !isAdult;

          });


        /*
         * Restore display when approved.
         *
         * Removing "hidden" allows CSS to control
         * the element normally.
         */

        if (isAdult) {

          document
            .querySelectorAll('[data-rating="AO"]')
            .forEach(element => {

              element.hidden = false;

            });
        }
      }


      /* =====================================================
         CLOSE MODAL
         ====================================================== */

      function closeModal() {

        stopCountdown();

        overlay.classList.remove(
          "is-visible"
        );

        overlay.setAttribute(
          "aria-hidden",
          "true"
        );

        document.body.classList.remove(
          "age-modal-open"
        );
      }


      /* =====================================================
         SAVE + APPLY
         ====================================================== */

      function setAge(age) {

        /*
         * Only these values are accepted.
         */

        const validAge =
          age === "21+"
            ? "21+"
            : "G";


        saveAge(validAge);

        applyAgeMode(validAge);

        closeModal();
      }


      /* =====================================================
         COUNTDOWN
         ====================================================== */

      function stopCountdown() {

        if (countdown !== null) {

          clearInterval(countdown);

          countdown = null;
        }
      }


      function startCountdown() {

        stopCountdown();

        remaining =
          AGE_CONFIG.countdownSeconds;

        timer.textContent =
          remaining;


        countdown = setInterval(() => {

          remaining--;

          timer.textContent =
            Math.max(remaining, 0);


          if (remaining <= 0) {

            stopCountdown();

            /*
             * No interaction = G.
             */

            setAge(
              AGE_CONFIG.defaultAge
            );
          }

        }, 1000);
      }


      /* =====================================================
         SHOW MODAL
         ====================================================== */

      function showModal() {

        overlay.classList.add(
          "is-visible"
        );

        overlay.setAttribute(
          "aria-hidden",
          "false"
        );

        document.body.classList.add(
          "age-modal-open"
        );

        startCountdown();

        /*
         * Put keyboard focus on the primary action.
         */

        requestAnimationFrame(() => {

          yesButton.focus();

        });
      }


      /* =====================================================
         INITIALIZE
         ====================================================== */

      function initializeAgeGate() {

        const savedAge =
          getSavedAge();


        if (savedAge === "21+") {

          /*
           * Previously approved 21+.
           */

          applyAgeMode("21+");

          return;
        }


        if (savedAge === "G") {

          /*
           * Previously selected G.
           */

          applyAgeMode("G");

          return;
        }


        /*
         * No stored configuration.
         *
         * Start the 5-second confirmation modal.
         */

        applyAgeMode("G");

        showModal();
      }


      /* =====================================================
         BUTTON EVENTS
         ====================================================== */

      yesButton.addEventListener(
        "click",
        () => {

          setAge("21+");

        }
      );


      noButton.addEventListener(
        "click",
        () => {

          setAge("G");

        }
      );


      /*
       * Allow the visitor to change their stored
       * configuration later.
       */

      changeButton.addEventListener(
        "click",
        () => {

          /*
           * Remove saved choice first.
           */

          try {

            localStorage.removeItem(
              AGE_CONFIG.storageKey
            );

          } catch (error) {}

          /*
           * Always reset to G while asking again.
           */

          applyAgeMode("G");

          showModal();
        }
      );


      /* =====================================================
         KEYBOARD ACCESSIBILITY
         ====================================================== */

      document.addEventListener(
        "keydown",
        event => {

          /*
           * Don't allow Escape to bypass
           * the age confirmation.
           */

          if (
            overlay.classList.contains(
              "is-visible"
            ) &&
            event.key === "Escape"
          ) {

            event.preventDefault();

          }

        }
      );


      /* =====================================================
         START
         ====================================================== */

      initializeAgeGate();

    })();