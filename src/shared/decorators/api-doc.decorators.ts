import {
  ApiResponseSchemaHost,
  getSchemaPath,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ExternalDocumentationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { EmptyResponseDto, ResponseDto, ErrorResponseDto } from '../dto';

export interface IApiDoc {
  okMessage?: string;
  okSchema?: EmptyResponseDto | null;
  okSchemaShape?: Array<any> | Array<Array<any>>;
  summary?: string;
  operationId: string;
  externalDocs?:
    | Array<ExternalDocumentationObject & { version?: number }>
    | (ExternalDocumentationObject & { version?: number });
  description?: string;
}

type DtoClass = new (...args: any[]) => any;

export function ApiDoc({
  description = '',
  operationId,
  okMessage: apiOkResponseDescription = 'Success response',
  okSchema = EmptyResponseDto,
  okSchemaShape,
  externalDocs,
  summary,
}: IApiDoc) {
  const isResponseDtoArray = Array.isArray(okSchema);
  let responseDtoSchema: ApiResponseSchemaHost['schema'];
  let responseExamples: Record<string, any> = {};
  const extraModels: any[] = [];
  if (okSchemaShape && okSchemaShape.length > 0) {
    responseDtoSchema = {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            payload: {
              oneOf: okSchemaShape.map((dto: unknown) => {
                if (
                  Array.isArray(dto) &&
                  dto[0] &&
                  typeof dto[0] === 'function'
                ) {
                  extraModels.push(dto[0] as DtoClass);
                  return {
                    type: 'array',
                    items: { $ref: getSchemaPath(dto[0] as DtoClass) },
                  };
                } else if (typeof dto === 'function') {
                  extraModels.push(dto as DtoClass);
                  return { $ref: getSchemaPath(dto as DtoClass) };
                }
                return {};
              }),
            },
          },
        },
      ],
    };
    responseExamples = (okSchemaShape as DtoClass[]).reduce(
      (acc: Record<string, any>, dto: unknown) => {
        if (Array.isArray(dto) && dto[0] && typeof dto[0] === 'function') {
          const name = (dto[0] as DtoClass).name;
          acc[name] = { externalValue: getSchemaPath(dto[0] as DtoClass) };
        } else if (typeof dto === 'function') {
          const name = (dto as DtoClass).name;
          acc[name] = { externalValue: getSchemaPath(dto as DtoClass) };
        }
        return acc;
      },
      {},
    );
  } else {
    responseDtoSchema = {
      allOf: [
        { $ref: getSchemaPath(ResponseDto) },
        {
          properties: {
            payload: isResponseDtoArray
              ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(okSchema[0] as DtoClass) },
                }
              : { $ref: getSchemaPath(okSchema as DtoClass) },
          },
        },
      ],
    };
  }

  let docDescription = description;

  if (externalDocs) {
    docDescription += `\n## Documentation\n`;
    if (Array.isArray(externalDocs)) {
      docDescription += `\n| Link | Description | Version |\n| --- | ----------- | ------- |\n${externalDocs
        .map(({ url, description, version }) => {
          const displayVersion = version ?? '-';
          return `| [🔗 View](${url}) | ${description} | ${displayVersion} |`;
        })
        .join('\n')}\n`;
    } else {
      const { url, description, version } =
        externalDocs as ExternalDocumentationObject & {
          version?: number;
        };
      const displayVersion = version ?? '-';
      docDescription += `\n| Link | Description | Version |\n| --- | ----------- | ------- |\n| [🔗 View](${url}) | ${description} | ${displayVersion} |\n`;
    }
  }

  const effects = [
    ApiExtraModels(
      ResponseDto,
      isResponseDtoArray ? (okSchema[0] as DtoClass) : (okSchema as DtoClass),
      ErrorResponseDto,
      ...(extraModels as DtoClass[]),
    ),
    ApiOperation({
      operationId,
    }),
    ApiOkResponse({
      description: apiOkResponseDescription,
      schema: responseDtoSchema,
      examples:
        Object.keys(responseExamples).length > 0 ? responseExamples : undefined,
    }),
  ];

  if (summary || docDescription) {
    effects.push(
      ApiOperation({
        summary,
        description: docDescription,
      }),
    );
  }

  if (
    okSchema &&
    typeof okSchema === 'function' &&
    (okSchema as DtoClass).name !== 'EmptyResponseDto'
  ) {
    effects.push(SetMetadata('SERIALIZER_DTO', okSchema));
  }

  return applyDecorators(...effects);
}
