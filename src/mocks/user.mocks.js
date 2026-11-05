import { faker } from "@faker-js/faker"
import { USER_ROLES, MOCKING_PARAMETERS } from "../constants/index.js"

const mockeables_roles = [
    USER_ROLES.CUSTOMER,
    USER_ROLES.DRIVER,
    USER_ROLES.STORE
]
export const generateMockUser = () => {

    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const email = faker.internet.email((firstName, lastName).toLocaleLowerCase())
    const role = faker.helpers.arrayElement(mockeables_roles)
    const defaultPassword = MOCKING_PARAMETERS.DEFAULT_PASSWORD
    const user = {
        firstName,
        lastName,
        email,
        password: defaultPassword,
        role,
        isAvailable: role === USER_ROLES.DRIVER ? true : false
    }
    return user

}

export const generateMockUsers = (qty) => {
    const usersData = []

    for (let i = 0; i< qty; i++){
         if (i === 0) {
            usersData.push(generateMockUser(USER_ROLES.CUSTOMER));
        } else if (i === 1) {
            usersData.push(generateMockUser(USER_ROLES.DRIVER));
        } else {
            usersData.push(generateMockUser());
        }
    }

    return usersData

}