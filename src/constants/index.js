export const ORDER_STATUS = Object.freeze(
{
    CREATED: 'created', 
    ASSIGNED: 'assigned', 
    PICKED_UP: 'picked_up',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered', 
    CANCELLED: 'cancelled'
}
) 
export const ORDER_PRIORITY = Object.freeze({
    LOW: 'low',
    NORMAL: 'normal',
    HIGH: 'high'
}
)


export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  USER: "user",
  CUSTOMER: "customer",
  DRIVER: "driver",
  STORE: "store"
});

export const PRODUCT_STATUS = Object.freeze({
  AVAILABLE: "available",
  OUT_OF_STOCK: "out_of_stock"
});

export const MOCKING_PARAMETERS = Object.freeze({
  MAX: 50,
  DEFAULT: 10,
  DEFAULT_PASSWORD: "coder123"
})


export const DELIVERY_STATUS = Object.freeze({
  PENDING: "pending",
  ASSIGNED: "assigned",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered"
})

// constantes Multer

export const DOCUMENT_TYPES = Object.freeze({
  DRIVER_LICENSE: "driver_license",
  USER_DOCUMENT: "user_document"
})

// Configuración de carga de archivos
export const UPLOAD_CONFIG = Object.freeze({
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
  ALLOWED_MIME_TYPES: Object.freeze(["application/pdf", "image/jpeg", "image/png"]),
  // Subcarpetas dentro de la carpeta de uploads
  FOLDERS: Object.freeze({
    DOCUMENTS: "documents", // documentos y licencias de usuario
    RECEIPTS: "receipts",   // comprobantes de pedidos
    PROOFS: "proofs"        // comprobantes de entrega
  })
})

// Tipo de documento de los comprobantes de entrega
export const PROOF_TYPES = Object.freeze({
  DELIVERY_PROOF: "delivery_proof"
})
 