let inputs = document.querySelectorAll('input')

inputs.forEach(input => {
  let inputName = input.getAttribute('name')

  let localStorageContent = localStorage.getItem('input-' + inputName)

  if (localStorageContent) {
    input.value = localStorageContent
  }

  input.addEventListener('input', event => {
    localStorage.setItem('input-' + inputName, event.target.value)
  })
})