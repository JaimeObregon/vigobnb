document.body.innerHTML = `
	<h1>Hello world!</h1>
`


const response = await fetch('/.netlify/functions/airbnb-fetch')
const data = await response.json()

console.log(data)
