<template>
  <div>
    <form class="user-reg-form">
      <p style="background-color: transparent; border: none">&nbsp;</p>
      <button style="background-color: transparent; border: 0.01em solid transparent">lj;lsdfjglksjdfg</button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
  .user-reg-form {
    width: 60%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1em;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    & span {
      text-align: center;
      & span {
        color: var(--primary-color);
      }
    }
    & input,
    p {
      width: calc(100% - 1em);
      padding: 0.5em;
      border: 0.1em solid var(--border-color);
      border-radius: 0.4em;
      outline: none;
      background-color: transparent;
      color: var(--text-color);
    }
    & input::placeholder {
      color: var(--text-color);
    }
    & p:nth-child(2) {
      font-size: 1em;
    }
    & div {
      display: flex;
      justify-content: center;
      align-items: center;
      align-self: flex-start;
      position: relative;
      gap: 2em;
      & input[type="checkbox"] {
        display: none;
      }
      & label {
        margin: 0 0 0 3em;
        user-select: none;
      }
      & input[type="checkbox"]:not(:checked) + label:before,
      input[type="checkbox"]:not(:checked) + label:before,
      input[type="checkbox"]:checked + label:after {
        content: "";
        position: absolute;
        left: 0;
        transform: translate(0, -15%);
        width: 2em;
        aspect-ratio: 1/1;
        border: 0.1em solid ar(--border-color);
        border-radius: 0.5em;
      }
      & input[type="checkbox"]:checked + label:after {
        background: url("@/share/assets/icons/checkedIcon.svg") center / 80% no-repeat;
      }
    }
    & button {
      display: block;
      padding: 1em 0;
      width: 100%;
      border: none;
      outline: none;
      background-color: var(--button-deactivate-color);
      color: var(--text-color);
      border-radius: 0.4em;
    }
  }
</style>
