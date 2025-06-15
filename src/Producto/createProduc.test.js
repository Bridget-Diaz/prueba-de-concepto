const { handler } = require('./createProduct');
const sinon = require('sinon');
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

describe('createProduct handler', () => {
    let sendStub;
    let sqsSendStub;

    beforeEach(() => {
        sendStub = sinon.stub(DynamoDBClient.prototype, 'send');
        sendStub.withArgs(sinon.match.instanceOf(PutItemCommand)).resolves({});

        sqsSendStub = sinon.stub(SQSClient.prototype, 'send');
        sqsSendStub.withArgs(sinon.match.instanceOf(SendMessageCommand)).resolves({
            MessageId: '12345'
        });

        process.env.TABLE_PRODUCTO = 'TestTable';
        process.env.SQS_QUEUE_URL = 'test-queue-url';
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a product and send to SQS', async () => {
        const event = {
            body: JSON.stringify({
                id: '123',
                nombre: 'Producto Test',
                categoria: 'Test',
                precio: 100,
                stock: 10
            })
        };

        const response = await handler(event);

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.mensaje).toBe('registro exitoso');
        expect(body.detalle.id).toBe('123');
        expect(body.detalle.nombre).toBe('Producto Test');
        expect(body.detalle.categoria).toBe('Test');
        expect(body.detalle.precio).toBe(100);
        expect(body.detalle.stock).toBe(10);

        sinon.assert.calledOnce(sendStub);
        sinon.assert.calledOnce(sqsSendStub);
    });

    it('should return error when missing fields', async () => {
        const event = {
            body: JSON.stringify({
                id: '123'
            })
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Faltan campos requeridos');
        expect(body.missingFields).toContain('nombre');
        expect(body.missingFields).toContain('categoria');
        expect(body.missingFields).toContain('precio');
        expect(body.missingFields).toContain('stock');
    });

    it('should return error when no body', async () => {
        const event = {};
        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Cuerpo de la solicitud faltante');
    });

    it('should return error when invalid JSON', async () => {
        const event = {
            body: 'invalid json'
        };

        const response = await handler(event);
        expect(response.statusCode).toBe(400);
        const body = JSON.parse(response.body);
        expect(body.error).toBe('Cuerpo de la solicitud no es JSON válido');
    });
});