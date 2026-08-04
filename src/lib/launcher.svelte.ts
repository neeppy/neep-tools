class LauncherState {
  open = $state(false);
  query = $state('');

  show() {
    this.query = '';
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  toggle() {
    if (this.open) this.hide();
    else this.show();
  }
}

export const launcher = new LauncherState();
