//tracking users in the rooms

const users =[]

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({id, username, room})=>{
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if(!username || !room){
        return {
            error: 'username and room are required!'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room ===room && user.username ===username
    })

    //validate username
    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    //store user
    const user = {id, username, room}
    users.push(user)
    return { user }
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id ===id
    })

    if(index !== -1){           //if user is found, remove them from the array
        return users.splice(index, 1)[0]
    }
}

// addUser({
//     id: 22,
//     username: 'Amol',
//     room: 'ld ld'
// })

// addUser({
//     id: 42,
//     username: 'Mike',
//     room: 'ld ld'
// })

// addUser({
//     id: 32,
//     username: 'Andrew',
//     room: 'noida'
// })


const getUser = (id)=>{
    const usersfound = users.find((user)=>{
        return user.id===id
    })

    return usersfound
}



const getUsersInRoom = (room)=>{
    const usersfound = users.filter((user)=>{
        return user.room === room
    })

    return usersfound
}

//console.log(getUsersInRoom('ld ld'))

// console.log(users)

// const removedUser = removeUser(22)

// console.log(removedUser)
// console.log(users)


module.exports ={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

