const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const ddbClient = new DynamoDBClient({ region: "us-east-2" });


exports.handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const { id, nombre, categoria, precio, stock } = body;

        // Guardar en DynamoDB
        const putCommand = new PutItemCommand({
            TableName: "UE2DESADYNPRODUCTO001",
            Item: {
                "producto-id": { S: id },
                nombre: { S: nombre },
                categoria: { S: categoria },
                precio: { N: precio.toString() },
                stock: { N: stock.toString() }
            }
        });

        await ddbClient.send(putCommand);


        return {
            statusCode: 200,
            body: JSON.stringify({ mensaje: "registro exitoso" })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ocurrió un error al registrar el producto" })
        };
    }
};