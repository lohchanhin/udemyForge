async function loadExtensions(icons, viewer) {
  console.log(viewer)
  await viewer.loadExtension("TransformationExtension");
  await viewer.loadExtension("IconMarkupExtension", {
    button: {
      icon: "fa-thumb-tack",
      tooltip: "顯示標記",
    },
    icons: icons,
    onClick: (id) => {
      viewers.select(id);
      viewers.utilities.fitToView();
      switch (id) {
        case 563:
          alert("Sensor offline");
      }
    },
  });
}
