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
    article.classList.add('js-article');
    article.addEventListener('dblclick', onDblClickArticle)

    const header = document.createElement('header');

    const timestamp = document.createElement('span');
    timestamp.innerText = (new Date()).toLocaleString();
    header.appendChild(timestamp);

    const remove = document.createElement('a');
    remove.classList.add('js-remove');
    remove.href = '#';
    remove.innerText = '[x]';
    remove.addEventListener('click', onClickRemove);
    header.appendChild(remove);

    article.appendChild(header);

    const img = document.createElement('img');
    img.classList.add('js-content');
    img.src = uri;
    article.appendChild(img);

    container.appendChild(article);
  };

  const addPlainText = (text: string) => {
    const article = document.createElement('article');
    article.classList.add('js-article');
    article.addEventListener('dblclick', onDblClickArticle)

    const header = document.createElement('header');

    const timestamp = document.createElement('span');
    timestamp.innerText = (new Date()).toLocaleString();
    header.appendChild(timestamp);

    const remove = document.createElement('a');
    remove.classList.add('js-remove');
    remove.href = '#';
    remove.innerText = '[x]';
    remove.addEventListener('click', onClickRemove);
    header.appendChild(remove);

    article.appendChild(header);

    const content = document.createElement('pre');
    content.classList.add('js-content');
    content.innerText = text;
    article.appendChild(content);

    container.appendChild(article);
  };

  const onPaste = (event: ClipboardEvent) => {
    for (const item of event.clipboardData?.items ?? []) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob === null) {
          continue;
        }

        toDataURI(blob)
          .then(addImage);

        break;
      }

      if (item.kind === 'string' && item.type === 'text/plain') {
        item.getAsString(addPlainText);
        break;
      }
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

  const onDblClickArticle = async (event: MouseEvent) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const article = target.closest('.js-article');
    if (article === null) {
      return;
    }

    const content = article.querySelector('.js-content');
    if (content === null) {
      return;
    }

    if (content instanceof HTMLImageElement) {
      const blob = await fetch(content.src).then(x => x.blob());
      const item = new ClipboardItem({
        [blob.type]: blob
      });

      await navigator.clipboard.write([item]);
    }

    if (content instanceof HTMLPreElement) {
      await navigator.clipboard.writeText(content.innerText);
    }
  };

  document.addEventListener('paste', onPaste);
  heading.addEventListener('click', onClickHeading);

  for (const elem of document.querySelectorAll('.js-remove')) {
    if (elem instanceof HTMLElement) {
      elem.addEventListener('click', onClickRemove);
    }
  }

  for (const elem of document.querySelectorAll('.js-article')) {
    if (elem instanceof HTMLElement) {
      elem.addEventListener('dblclick', onDblClickArticle);
    }
  }

  document.removeEventListener('DOMContentLoaded', onDOMContentLoaded);
});
