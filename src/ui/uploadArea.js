export function initUploadArea(onFile = () => {}) {
  const container = document.getElementById('upload-container');
  const input = document.getElementById('upload');
  if (!container || !input) {
    return { destroy() {} };
  }

  function handleFile(file) {
    if (file) onFile(file);
  }

  function handleClick() {
    input.value = '';
    input.click();
  }

  function handleChange(event) {
    const file = event.target.files && event.target.files[0];
    handleFile(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    container.classList.add('dragover');
  }

  function handleDragLeave() {
    container.classList.remove('dragover');
  }

  function handleDrop(e) {
    e.preventDefault();
    container.classList.remove('dragover');
    const file = e.dataTransfer && e.dataTransfer.files[0];
    handleFile(file);
  }

  container.addEventListener('click', handleClick);
  input.addEventListener('change', handleChange);
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('dragleave', handleDragLeave);
  container.addEventListener('drop', handleDrop);

  return {
    destroy() {
      container.removeEventListener('click', handleClick);
      input.removeEventListener('change', handleChange);
      container.removeEventListener('dragover', handleDragOver);
      container.removeEventListener('dragleave', handleDragLeave);
      container.removeEventListener('drop', handleDrop);
    },
  };
}
