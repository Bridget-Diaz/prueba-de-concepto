const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const ddbClient = new DynamoDBClient({
    region: "us-east-2"
});

exports.handler = async () => {
    try {
        const scanCommand = new ScanCommand({
            TableName: "UE2DESADYNPRODUCTO001"
        });

        const { Items } = await ddbClient.send(scanCommand);

        return {
            statusCode: 200,
            body: JSON.stringify(Items)
        };
    } catch (err) {
        console.error("Error al obtener productos:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error al obtener productos" })
        };
    }
};