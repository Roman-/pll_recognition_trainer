<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <h1 class="text-center mb-4">PLL Recognition Trainer</h1>
        <div class="ratio ratio-16x9 mb-4">
          <iframe
              src="https://www.youtube.com/embed/lIjel-amSeg"
              title="PLL Recognition Explained"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
          ></iframe>
        </div>
        <p class="text-center mb-4">
          Practice recognizing all 21 PLL cases from any angle and color.
          The trainer adapts to your weaknesses — cases you struggle with
          come back more often until you nail them.
        </p>
        <div class="text-center">
          <router-link to="/trainer" class="btn btn-primary btn-lg">Start Training</router-link>
        </div>
      </div>
    </div>
  </div>
</template>