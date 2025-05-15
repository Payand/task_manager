import {
  ApiResponseSchemaHost,
  getSchemaPath,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { applyDecorators, SetMetadata } from "@nestjs/common";
import { ExternalDocumentationObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { EmptyResponseDto, ResponseDto, ErrorResponseDto } from "src/shared/dto";

export interface IApiDoc {
  okMessage?: string;
  okSchema?: any | null;
  okSchemaShape?: Array<any> | Array<Array<any>>;
  summary?: string;
  operationId: string;
  externalDocs?:
    | Array<ExternalDocumentationObject & { version?: number }>
    | (ExternalDocumentationObject & { version?: number });
  description?: string;
}

export function ApiDoc({
  summary = "",
  description = "",
  operationId,
  okMessage: apiOkResponseDescription = "Success response",
  okSchema = EmptyResponseDto,
  okSchemaShape,
  externalDocs,
}: IApiDoc) {
  const isResponseDtoArray = Array.isArray(okSchema);
  let responseDtoSchema: ApiResponseSchemaHost["schema"];
  let responseExamples: Record<string, any> = {};
  const extraModels: any[] = [];

  if (okSchemaShape && okSchemaShape.length > 0) {
    responseDtoSchema = {
      allOf: [
        {
          $ref: getSchemaPath(ResponseDto),
        },
        {
          properties: {
            payload: {
              oneOf: okSchemaShape.map((dto) => {
                const isDtoArray = Array.isArray(dto);
                if (isDtoArray) {
                  extraModels.push(dto[0]);
                  return {
                    type: "array",
                    items: {
                      $ref: getSchemaPath(dto[0]),
                    },
                  };
                }
                extraModels.push(dto);
                return {
                  $ref: getSchemaPath(dto),
                };
              }),
            },
          },
        },
      ],
    };
    responseExamples = (okSchemaShape as any[]).reduce((acc: Record<string, any>, dto: any) => {
      if (Array.isArray(dto)) {
        if (dto[0] && typeof dto[0] === 'function' && dto[0].name) {
          acc[dto[0].name] = {
            externalValue: getSchemaPath(dto[0]),
          };
        }
      } else if (dto && typeof dto === 'function' && dto.name) {
        acc[dto.name] = {
          externalValue: getSchemaPath(dto),
        };
      }
      return acc;
    }, {});
  } else {
    responseDtoSchema = {
      allOf: [
        {
          $ref: getSchemaPath(ResponseDto),
        },
        {
          properties: {
            payload: isResponseDtoArray
              ? {
                  type: "array",
                  items: {
                    $ref: getSchemaPath(okSchema[0]),
                  },
                }
              : {
                  $ref: getSchemaPath(okSchema),
                },
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
          const displayVersion = version ?? "-";
          return `| [🔗 View](${url}) | ${description} | ${displayVersion} |`;
        })
        .join("\n")}\n`;
    } else {
      const { url, description, version } = externalDocs as ExternalDocumentationObject & {
        version?: number;
      };
      const displayVersion = version ?? "-";
      docDescription += `\n| Link | Description | Version |\n| --- | ----------- | ------- |\n| [🔗 View](${url}) | ${description} | ${displayVersion} |\n`;
    }
  }

  const effects = [
    ApiExtraModels(
      ResponseDto,
      isResponseDtoArray ? okSchema[0] : okSchema,
      ErrorResponseDto,
      ...extraModels
    ),
    ApiOperation({
      operationId,
    }),
    ApiOkResponse({
      description: apiOkResponseDescription,
      schema: responseDtoSchema,
      examples: Object.keys(responseExamples).length > 0 ? responseExamples : undefined,
    }),
  ];

  if (summary || docDescription) {
    effects.push(
      ApiOperation({
        summary,
        description: docDescription,
      })
    );
  }

  if (okSchema && okSchema.name !== "EmptyResponseDto") {
    effects.push(SetMetadata("SERIALIZER_DTO", okSchema));
  }

  return applyDecorators(...effects);
}

