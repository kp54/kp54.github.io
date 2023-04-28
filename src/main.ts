document.addEventListener('DOMContentLoaded', function onDOMContentLoaded() {
  const title = document.querySelector('title');
  const heading = document.querySelector('h1');
  const container = document.querySelector('main');

  if (title === null || heading === null || container === null) {
    throw new Error('Some of the required nodes are missing.');
  }

  const onClickRemove = (event: MouseEvent) => {
    event.preventDefault();

    if (event.type !== 'click') {
      return;
    }

    const elem = event.target;
    if (!(elem instanceof HTMLElement)) {
      return;
    }

    const article = elem.closest('article');
    if (article === null) {
      return;
    }

    article.remove();
  };

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

    const header = document.createElement('header');

    const timestamp = document.createElement('span');
    timestamp.innerText = (new Date()).toLocaleString();
    header.appendChild(timestamp);

    const remove = document.createElement('a');
    remove.classList.add('js-remove');
    remove.href = '#';
    remove.onclick = onClickRemove;
    remove.innerText = '[x]';
    header.appendChild(remove);

    article.appendChild(header);

    const img = document.createElement('img');
    img.src = uri;
    article.appendChild(img);

    container.appendChild(article);
  };

  const onPaste = (event: ClipboardEvent) => {
    for (const item of event.clipboardData?.items ?? []) {
      if (item.kind !== 'file' || !item.type.startsWith('image/')) {
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

  document.querySelectorAll('.js-remove')
    .forEach(x => {
      if (x instanceof HTMLElement) {
        x.addEventListener('click', onClickRemove);
      }
    });

  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
});
