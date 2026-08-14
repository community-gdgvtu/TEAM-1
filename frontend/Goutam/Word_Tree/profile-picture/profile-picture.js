// =====================================
// PROFILE PICTURE POPUP
// =====================================


function initializeProfilePopup() {

   const popup =
      document.getElementById("profilePopup");


   const closeButton =
      document.getElementById(
         "closeProfilePopup"
      );


   const uploadButton =
      document.getElementById(
         "uploadProfilePicture"
      );


   const profileUserName =
      document.getElementById(
         "profileUserName"
      );


   const profileImage =
      document.getElementById(
         "profilePopupImage"
      );


   // =====================================
   // LOAD LOGGED-IN USERNAME
   // =====================================

   const storedUser =
      localStorage.getItem(
         "wordtree_user"
      );


   if (storedUser) {

      try {

         const user =
            JSON.parse(
               storedUser
            );


         profileUserName.textContent =
            user.username ||
            "USER";

      }
      catch (error) {

         console.error(
            "Could not load user:",
            error
         );


         profileUserName.textContent =
            "USER";

      }

   }
   else {

      profileUserName.textContent =
         "USER";

   }


   // =====================================
   // LOAD SAVED PROFILE PICTURE
   // =====================================

   const savedProfilePicture =
      localStorage.getItem(
         "wordtree_profile_picture"
      );


   if (
      savedProfilePicture &&
      profileImage
   ) {

      profileImage.src =
         savedProfilePicture;

   }


   // =====================================
   // CREATE HIDDEN FILE INPUT
   // =====================================

   const fileInput =
      document.createElement(
         "input"
      );


   fileInput.type =
      "file";


   fileInput.accept =
      "image/png, image/jpeg, image/webp";


   fileInput.style.display =
      "none";


   document.body.appendChild(
      fileInput
   );


   // =====================================
   // UPLOAD BUTTON
   // =====================================

   uploadButton.addEventListener(
      "click",
      () => {

         fileInput.click();

      }
   );


   // =====================================
   // WHEN IMAGE IS SELECTED
   // =====================================

   fileInput.addEventListener(
      "change",
      () => {

         const file =
            fileInput.files[0];


         if (!file) {

            return;

         }


         // ONLY ALLOW IMAGES

         if (
            !file.type.startsWith(
               "image/"
            )
         ) {

            alert(
               "Please select an image file."
            );

            return;

         }


         // OPTIONAL SIZE LIMIT

         const maxSize =
            5 * 1024 * 1024;


         if (
            file.size >
            maxSize
         ) {

            alert(
               "Profile picture must be under 5MB."
            );

            return;

         }


         const reader =
            new FileReader();


         reader.addEventListener(
            "load",
            () => {

               const imageData =
                  reader.result;


               // UPDATE IMAGE

               if (profileImage) {

                  profileImage.src =
                     imageData;

               }


               // SAVE LOCALLY

               localStorage.setItem(
                  "wordtree_profile_picture",
                  imageData
               );


               console.log(
                  "Profile picture updated."
               );

            }
         );


         reader.readAsDataURL(
            file
         );

      }
   );


   // =====================================
   // CLOSE BUTTON
   // =====================================

   closeButton.addEventListener(
      "click",
      () => {

         popup.classList.remove(
            "active"
         );

      }
   );


   // =====================================
   // CLICK OUTSIDE POPUP
   // =====================================

   popup.addEventListener(
      "click",
      (event) => {

         if (
            event.target === popup
         ) {

            popup.classList.remove(
               "active"
            );

         }

      }
   );


   // =====================================
   // ESCAPE KEY
   // =====================================

   document.addEventListener(
      "keydown",
      (event) => {

         if (
            event.key === "Escape"
         ) {

            popup.classList.remove(
               "active"
            );

         }

      }
   );

}


// =====================================
// OPEN POPUP
// =====================================

function openProfilePopup() {

   const popup =
      document.getElementById(
         "profilePopup"
      );


   popup.classList.add(
      "active"
   );

}