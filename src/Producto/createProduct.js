//const { v4: uuidv4 } = require('uuid');
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");

const ddbClient = new DynamoDBClient({ region: "us-east-2" });
const sqsClient = new SQSClient({ region: "us-east-2" });

exports.handler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Cuerpo de la solicitud faltante" })
            };
        }

        let body;
        try {
            body = JSON.parse(event.body);
        } catch (e) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Cuerpo de la solicitud no es JSON válido" })
            };
        }

        const id = body.id;
        const nombre = body.nombre;
        const categoria = body.categoria;
        const precio = body.precio;
        const stock = body.stock;

        if (!id || !nombre || !categoria || precio === undefined || stock === undefined) {
            const missingFields = [];
            if (!id) missingFields.push('id');
            if (!nombre) missingFields.push('nombre');
            if (!categoria) missingFields.push('categoria');
            if (precio === undefined) missingFields.push('precio');
            if (stock === undefined) missingFields.push('stock');

            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: "Faltan campos requeridos",
                    missingFields
                })
            };
        }

        if (isNaN(precio) || isNaN(stock)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Precio y stock deben ser números válidos" })
            };
        }

        const precioNum = Number(precio);
        const stockNum = Number(stock);

        if (precioNum < 0 || stockNum < 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Precio y stock deben ser valores positivos" })
            };
        }

        const putCommand = new PutItemCommand({
            TableName: process.env.TABLE_PRODUCTO,
            Item: {
                "producto-id": { S: id.toString() },
                nombre: { S: nombre.toString() },
                categoria: { S: categoria.toString() },
                precio: { N: precioNum.toString() },
                stock: { N: stockNum.toString() }
            }
        });

        await ddbClient.send(putCommand);

        const sqsParams = {
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: JSON.stringify({
                message: "Nuevo producto creado",
                productId: id,
                productName: nombre,
                timestamp: new Date().toISOString()
            })
        };

        await sqsClient.send(new SendMessageCommand(sqsParams));

        return {
            statusCode: 200,
            body: JSON.stringify({
                mensaje: "registro exitoso",
                detalle: {
                    id,
                    nombre,
                    categoria,
                    precio: precioNum,
                    stock: stockNum
                }
            })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ocurrió un error al registrar el producto" })
        };
    }
};