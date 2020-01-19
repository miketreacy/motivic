<script>
  import { createEventDispatcher } from "svelte";
  import Modal from "./Modal.svelte";
  import ItemCrudForm from "./ItemCrudForm.svelte";
  export let show = false;
  export let itemType = "";
  export let formType = "";
  export let item = null;
  export let actionComplete = false;
  //   export let submitCallback = Function.prototype;

  let defaultModalProps = {
    itemType: "",
    item: null,
    formType: "",
    show: false,
    actionComplete: false
  };
  const dispatch = createEventDispatcher();
  function submitCallback() {
    console.log(`dispatchDismissModal() called (App.svelte)`);
    dispatch("displayCrudModal", { modalProps: defaultModalProps });
  }
</script>

<style>

</style>

<Modal on:displayCrudModal {show}>
  <ItemCrudForm
    {itemType}
    {formType}
    {item}
    {submitCallback}
    {actionComplete}
    on:displayCrudModal />
</Modal>
