import "/app/scss/main.scss";

// $ An HTML element

export const App = {
  buildProjectCardTemplate(projectInfo) {
    const features = projectInfo.features
      .map((feature) => {
        return `<li class="projects__feature">${feature}</li>`;
      })
      .join("");
    const tools = projectInfo.tools
      .map((tool) => `<li class="projects__tool">${tool}</li>`)
      .join("");
    return `
  <li class="projects__list-item">
    <div class="projects__container--default">
      <article class="projects__item">
        <hgroup class="projects__heading-group">
          <h3 class="projects__title">${projectInfo.name}</h3>
          <p class="projects__description">${projectInfo.description}</p>
        </hgroup>
        <ul class="projects__features">
          ${features}
        </ul>
        <button 
          data-type="project-open"
          data-name=${projectInfo.name}
          data-opens=${projectInfo.path}
          data-min=${projectInfo.responsive.min}
          data-max=${projectInfo.responsive.max}
          class="btn">${this.projectsButtonMeta.text}
        </button>

        <span class="projects__tools-heading">Technologies</span>
        <footer class="projects__footer">
          <ul class="projects__tools">
            ${tools}
          </ul>
        </footer>
      </article>
    </div>
    <div class="projects__container--hover" aria-hidden="true">
      <article class="projects__item">
        <hgroup class="projects__heading-group">
          <h3 class="projects__title">${projectInfo.name}</h3>
          <p class="projects__description">${projectInfo.description}</p>
        </hgroup>
        <ul class="projects__features">
          ${features}
        </ul>
        <button 
          data-type="project-open"
          data-name=${projectInfo.name}
          data-opens=${projectInfo.path}
          data-min=${projectInfo.responsive.min}
          data-max=${projectInfo.responsive.max}
          class="projects__btn btn">${this.projectsButtonMeta.text}
        </button>
        <span class="projects__tools-heading">Technologies</span>
        <footer class="projects__footer">
          <ul class="projects__tools">
            ${tools}
          </ul>
        </footer>
      </article>
    </div>
  </li>`;
  },

  buildProjectDialogTemplate() {
    const { opens: projectPath } = this.projectClickTarget.dataset;
    const { name: projectName } = this.projectClickTarget.dataset;
    const { min: minWidth } = this.projectClickTarget.dataset;
    const { max: maxWidth } = this.projectClickTarget.dataset;

    const responsiveInputSlider = `
      <div class="project-showcase__responsive">
        <p class="project-showcase__range-text">Drag the slider</p>
        <input aria-desbribedby="responsive-slider-description" type="range" min="${minWidth}" max="${maxWidth}" id="responsive-slider" class="showcase__range" />
        <label for="responsive-slider" class="visually-hidden">Adjust page view</label>
        <span id="responsive-slider-description" class="visually-hidden">Change the view of the project page between mobile and desktop</span>
      </div>
    `;

    return `
  <div class="project-showcase">
    <div class="project-showcase__wrapper">
      <iframe class="project-showcase__iframe" data-name="${projectName}" src="${projectPath}" frameborder="0"></iframe>
      <button class="project-showcase__close btn" data-type="project-close">X</button>
      ${this.features.slider ? responsiveInputSlider : ""}
    </div>
  </div>`;
  },

  onRangeChange($input) {
    const $frameContainer = document.querySelector(
      ".project-showcase__wrapper",
    );

    const $frameRangerText = document.querySelector(
      ".project-showcase__range-text",
    );

    $frameRangerText.textContent = `${$input.value}px`;

    $frameContainer.style.width = `${$input.value}px`;
  },

  onInputChange(event) {
    const { target } = event;

    if (this.inputHandlers[target.type]) {
      this.inputHandlers[target.type](target);
      return;
    }

    throw new Error(`Handler for input type ${target.type} not found`);
  },

  buildProjects() {
    const projects = this.projects;
    const projectsHTML = projects.map((project) => {
      return this.buildProjectCardTemplate(project);
    });
    const template = document.createElement("template");
    template.innerHTML = projectsHTML.join("");
    this.$root.appendChild(template.content.cloneNode(true));
  },

  showProject() {
    const template = document.createElement("template");
    template.innerHTML = this.buildProjectDialogTemplate();
    const node = template.content.cloneNode(true);
    document.body.appendChild(node);
  },

  showMobile() {},

  showTablet() {},

  closeProject() {
    this.$body.querySelector(".project-showcase").className =
      "project-showcase--hidden";

    setTimeout(() => {
      this.$body.querySelector(".project-showcase--hidden").remove();
    }, 200);
  },

  projectHandler(action) {
    if (this.projectActions[action]) {
      this.projectActions[action]();
      return;
    }

    throw new Error(`Handler for action ${action} not found`);
  },

  onClick(event) {
    const { type: triggerType } = event.target.dataset;

    if (triggerType) {
      const [type, action] = triggerType.split("-");
      switch (type) {
        case "project":
          this.projectClickTarget = event.target;
          this.projectHandler(action);
          break;
      }
    }
  },

  addListener() {
    const $app = this.$body;
    $app.addEventListener("click", this.onClick.bind(this));
    $app.addEventListener("input", this.onInputChange.bind(this));
  },

  evaluateFeatures() {
    const { features } = this;
    const tabletBreakPoint = "(width >= 48em)";
    const view = window.matchMedia(tabletBreakPoint);

    if (view.matches) {
      features.slider = !features.slider;
    }
  },

  init(appData) {
    if (!appData) {
      throw new Error("Not data passed to init App");
    }

    if (!appData.projects) {
      throw new Error(
        "make sure there is a projects prop in app.data.json file or file is loaded",
      );
    }
    const projects = appData?.projects?.items;
    const metadata = appData?.projects?.meta;

    if (!projects) {
      throw new Error(
        "make sure there is 'items' props in projects app.data.json file",
      );
    }

    if (!projects.length) {
      throw new Error(
        "make sure there is at least one project in prop projects.items from app.data.json file",
      );
    }

    if (!metadata) {
      throw new Error("make sure projects has meta data like button");
    }

    this.projects = appData.projects.items;

    this.projectActions = {
      open: this.showProject.bind(this),
      close: this.closeProject.bind(this),
      // mobile: this.showMobile.bind(this),
      // tablet: this.showTablet.bind(this),
    };

    this.inputHandlers = {
      range: this.onRangeChange.bind(this),
    };

    this.features = {
      slider: false,
    };
    this.projectsButtonMeta = appData.projects.meta.button;
    this.$root = document.querySelector("#root");
    this.$body = document.querySelector("body");
    this.evaluateFeatures();
    this.addListener();
    this.buildProjects();
  },
};
