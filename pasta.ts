document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  const title = document.querySelector('title');
  const heading = document.querySelector('h1');
  const container = document.querySelector('main');

  if (title === null || heading === null || container === null) {
    throw new Error('Some of the required nodes are missing.');
  }

  const toDataURI = (blob: Blob) => new Promise((resolve: (value: string) => void) => {
    const reader = new FileReader();

    const onLoad = () => {
      if (typeof reader.result !== 'string') {
        throw new Error('FileReader has responded with invalid result.');
      }

      reader.removeEventListener('load', onLoad);
      resolve(reader.result);
    }

    reader.addEventListener('load', onLoad);
    reader.readAsDataURL(blob);
  });

  const addImage = (uri: string) => {
    const article = document.createElement('article');

    const div = document.createElement('div');
    div.innerText = (new Date()).toLocaleString();
    article.appendChild(div);

    const img = document.createElement('img');
    img.src = uri;
    article.appendChild(img);

    container.appendChild(article);
  };

  const onPaste = (event: ClipboardEvent) => {
    for (const item of event.clipboardData?.items ?? []) {
      if (item.kind !== 'file' || item.type !== 'image/png') {
        continue;
      }

      const blob = item.getAsFile();
      if (blob === null) {
        continue;
      }

      toDataURI(blob)
        .then(addImage);
    }
  };

  const onClickHeading = () => {
    const newTitle = window.prompt('Title', title.innerText);
    if (newTitle === null) {
      return;
    }

    title.innerText = newTitle;
    heading.innerText = newTitle;
  };

  document.addEventListener('paste', onPaste);
  heading.addEventListener('click', onClickHeading);

  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
});
