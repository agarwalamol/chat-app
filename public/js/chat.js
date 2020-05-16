const socket = io()

// socket.on('updatedCount',(count)=>{
//     console.log('The count has been updated', count)
// })

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('Clicked')
//     socket.emit('increment')
// })
//Elements:
const $locationButton = document.querySelector('#loc')  //using $ is a convention for dom objects
const $messageForm = document.querySelector('#form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#messages')

//Templates:
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //parsing query string 
const autoscroll =()=>{
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    
    const newMessageStyles = getComputedStyle($newMessage) //margin of the message does not get captured in offsetHeight
    const newMessageMMargin = parseInt(newMessageStyles.marginBottom)

    const newMessageHeight = $newMessage.offsetHeight + newMessageMMargin

    //visible Height of the container
    const visibleHeight = $messages.offsetHeight

    //total height of the container
    const containerHeight = $messages.scrollHeight

    //how far down have we scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    //logic to autoscroll
    if(containerHeight - newMessageHeight <= scrollOffset){     //if height of container before message came was 
        $messages.scrollTop = $messages.scrollHeight
    }


}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message1: message.message,
        createdAt: moment(message.createdAt).format('h:mm a') // using momentjs to format time as doing this is very tuff in javascript.
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()      //prevent full page reload when submit button is clicked.

    $messageFormButton.setAttribute('disabled','disabled')    //disable button to prevent multiple clicks

    const msg = e.target.elements.message.value //alternate way to get value of inpu field. to select form element by unique name
    //const msg= document.querySelector('input').value
    socket.emit('sendMessage', msg, (error)=>{
        //Enable button and focus on inpput field 
        $messageFormButton.removeAttribute('disabled')  //re-enable button
        $messageFormInput.value=''      //clear the input field after sending an refocus 
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message delivered ')
    })
})

$locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported on your browser')
    }
    $locationButton.setAttribute('disabled','disabled')   //disable button for a moment while location is being sent.
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },(error)=>{
            if(error){
                return console.log(error)
            }
            console.log('location shared!')
            
            $locationButton.removeAttribute('disabled')
        })
    })
})

socket.on('locationMessage', (location)=>{
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username: location.username,
        location: location.url,
        createdAt: moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href ='/'          //redirect to home page if error
    }
})