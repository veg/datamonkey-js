$(function () {
  function toggleSiteMultihit() {
    const multipleHitsValue = $("#multiple-hits").val();
    const siteMultihitDropdown = $("#site-multihit");

    if (multipleHitsValue === "None") {
      siteMultihitDropdown.prop("disabled", true);
      siteMultihitDropdown.val("Estimate"); // Default value when disabled
    } else {
      siteMultihitDropdown.prop("disabled", false);
    }
  }

  // Initialize dependent dropdown states on page load
  toggleSiteMultihit();

  // Handle changes in multiple hits selection
  $("#multiple-hits").change(function () {
    toggleSiteMultihit();
  });

  // Handle form submission
  $("form").submit(function (e) {
    e.preventDefault();

    $("#file-progress").removeClass("hidden");

    const formData = new FormData();

    // File validation
    const fileInput = document.getElementById("seq-file");
    const file = fileInput.files[0];

    if (!file) {
      $("#modal-error-msg").text("Please select a file to upload.");
      $("#errorModal").modal();
      return;
    }
    formData.append("files", file);

    // Gather and validate form data
    formData.append("gencodeid", $("select[name='gencodeid']").val());
    formData.append("multiple_hits", $("#multiple-hits").val());
    formData.append("site_multihit", $("#site-multihit").val());
    formData.append("rates", $("#rates").val());
    formData.append("resample", $("#resample").val());
    formData.append("impute_states", $("#impute-states").val());

    const email = $("input[name='mail']").val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      $("#modal-error-msg").text("Please enter a valid email address.");
      $("#errorModal").modal();
      return;
    }
    formData.append("mail", email);

    const actionUrl = $("#msa-form").attr("action");

    // Create XMLHttpRequest
    const xhr = new XMLHttpRequest();
    xhr.open("post", actionUrl, true);

    xhr.upload.onprogress = function (e) {
      if (e.lengthComputable) {
        const percentage = (e.loaded / e.total) * 100;
        $(".progress .progress-bar").css("width", percentage + "%");
      }
    };

    xhr.onerror = function () {
      $("#modal-error-msg").text("An error occurred during the upload.");
      $("#errorModal").modal();
    };

    xhr.onload = function () {
      try {
        const result = JSON.parse(this.responseText);

        if (result.error) {
          $("#modal-error-msg").text(result.error);
          $("#errorModal").modal();
        } else if (result.upload_redirect_path) {
          window.location.href = result.upload_redirect_path;
        } else {
          $("#modal-error-msg").text(
            "Unexpected response format from the server."
          );
          $("#errorModal").modal();
        }
      } catch (err) {
        $("#modal-error-msg").text("Error parsing server response.");
        $("#errorModal").modal();
      } finally {
        $(".progress .progress-bar").css("width", "0%");
        $("#file-progress").addClass("hidden");
      }
    };

    xhr.send(formData);
  });

  // Email validation on input
  $("input[name='mail']").on("input", function () {
    const email = $(this).val();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
      $(this).addClass("is-invalid");
    } else {
      $(this).removeClass("is-invalid");
    }
  });
});
