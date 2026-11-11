import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi:"3.0.0",
        info:{
            title:"Shipnow",
            version:"1.0.0",
            description:"Documentación de la API"
        },
        servers:[{url:"http://localhost:8080"}],

    }, apis:["./src/routes/*.js"]
   
}

export default swaggerJSDoc(options)