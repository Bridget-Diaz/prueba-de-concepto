const { DynamoDBClient, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");

const ddbClient = new DynamoDBClient({ region: "us-east-2" });

exports.handler = async (event) => {
    try {
        const { id } = event.pathParameters;
        const body = JSON.parse(event.body);
        const { nombre, categoria, precio, stock } = body;

        // Comprobamos campos requeridos
        if (!id || !nombre || !categoria || !precio || !stock) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Faltan datos para actualizar el producto" })
            };
        }

        const updateCommand = new UpdateItemCommand({
            TableName: "UE2DESADYNPRODUCTO001",
            Key: {
                "producto-id": { S: id }
            },
            UpdateExpression: "SET nombre = :n, categoria = :c, precio = :p, stock = :s",
            ExpressionAttributeValues: {
                ":n": { S: nombre },
                ":c": { S: categoria },
                ":p": { N: precio.toString() },
                ":s": { N: stock.toString() }
            }
        });

        await ddbClient.send(updateCommand);

        return {
            statusCode: 200,
            body: JSON.stringify({ mensaje: "producto actualizado correctamente" })
        };

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ocurrió un error al actualizar el producto" })
        };
    }
};