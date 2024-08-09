type TResponse = {
    body: any
    statusCode: number
}

type TGenericObject<T = any> = Record<string, T>

const blacklistedKeys = [
    'password'
]

export function createResponse(
    { body, statusCode }: TResponse,
    shouldStripSensitiveData = false
) {
    if (shouldStripSensitiveData) {
        const strippedBody = stripSensitiveData(body);
        return {
            statusCode,
            body: JSON.stringify(strippedBody),
            headers: {
                'Content-Type': 'application/json',
            },
        }
    }
    return {
        statusCode,
        body: body,
        headers: {
            'Content-Type': 'application/json',
        },
    }
}

function stripSensitiveData(body: TGenericObject): TGenericObject {
    const strippedBody: TGenericObject = {};

    for (const key in body) {
        if (!blacklistedKeys.includes(key)) {
            strippedBody[key] = body[key];
        }
    }

    return strippedBody;
}
