export const EErrors = {
  ROUTING_ERROR:1,
  INVALID_TYPES_ERROR:2,
  DATABASE_ERROR:3,
  NOT_FOUND_ERROR:4,
  RESOURCE_ALREADY_EXISTS:5,
  INVALID_RESOURSE_PROPERTY:6,
  MISSING_API_KEY:7,
}

export const ErrorDictionary = {
  USER_NOT_FOUND: {name:"UserNotFound", code:EErrors.NOT_FOUND_ERROR, status: 404, message:"Usuario no encontrado" },

  PRODUCT_NOT_FOUND: {name:"ProductNotFound", code:EErrors.NOT_FOUND_ERROR, status: 404, message:"Producto no encontrado" }, 

  ORDER_NOT_FOUND: {name:"OrderNotFound", code:EErrors.NOT_FOUND_ERROR, status: 404, message:"Pedido no encontrado" },

  DELIVERY_NOT_FOUND: {name:"DeliveryNotFound", code:EErrors.NOT_FOUND_ERROR, status: 404, message:"Entrega no encontrada" },

  INVALID_STATUS: {name:"InvalidStatus", code:EErrors.INVALID_TYPES_ERROR, status: 400, message:"Estado de pedido invalido" },

  ADMIN_CREATION_FORBIDDEN:{name:"AdminCreationForbidden", code:EErrors.INVALID_RESOURSE_PROPERTY, status: 403, message:"No se puede crear un admin desde este endpoint"},

  USER_ALREADY_EXISTS:{name:"UserAlreadyExists", code:EErrors.RESOURCE_ALREADY_EXISTS, status: 409, message:"Ya existe un usuario"},

  INVALID_QUANTITY: { name: "InvalidQuantity", code: EErrors.INVALID_RESOURSE_PROPERTY, status: 400, message: "Cantidad inválida"},

  MISSING_API_KEY: {name: "MissingApiKey", code: EErrors.MISSING_API_KEY, status: 500, message: "Configuración inválida: falta API Key"},

  INVALID_ID:{ name: "InvalidId", code: EErrors.INVALID_TYPES_ERROR,  status: 400, message: "El ID recibido no es válido" },

  INVALID_JSON:{ name: "InvalidJson",   code: EErrors.INVALID_TYPES_ERROR,  status: 400, message: "El cuerpo de la petición no es un JSON válido" },

  ROUTE_NOT_FOUND: { name: "RouteNotFound", code: EErrors.ROUTING_ERROR, status: 404, message: "Ruta no encontrada" },

  INVALID_PRICE:{ name: "InvalidPrice",   code: EErrors.INVALID_RESOURSE_PROPERTY,  status: 400, message: "El precio debe ser un número mayor o igual a 0." }, 

  INVALID_STOCK:{ name: "InvalidStock",   code: EErrors.INVALID_RESOURSE_PROPERTY,  status: 400, message: "El stock debe ser un número mayor o igual a 0." },

  MISSING_REQUIRED_FIELDS: {name:"MissingRequiredFields", code:EErrors.INVALID_RESOURSE_PROPERTY, status: 400, message:"Falta información requerida."},

  VALIDATION_ERROR: { name: "ValidationError", code: EErrors.INVALID_RESOURSE_PROPERTY, status: 400, message: "Datos inválidos" },

  DUPLICATE_KEY: { name: "DuplicateKey", code: EErrors.RESOURCE_ALREADY_EXISTS, status: 409, message: "Ya existe un registro con ese valor" },

  MOCK_DATA_MISSING: { name:"MockDataMissing", code:EErrors.INVALID_RESOURSE_PROPERTY, status: 400, message: "Faltan datos previos para generar los mocks" },

  DATABASE_ERROR: { name: "DatabaseError", code: EErrors.DATABASE_ERROR, status: 500, message: "Error al guardar los datos en la base de datos" },
}


export const createError = ({name, code, status, message, cause}) => {
  const error = new Error(message,{cause})
  error.name= name
  error.code = code
  error.status = status
  return error
}