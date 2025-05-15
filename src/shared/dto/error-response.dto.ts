import { ApiProperty } from "@nestjs/swagger";

export class ErrorResponseDto {
  @ApiProperty({
    description: "HTTP status code",
  })
  statusCode: number;

  @ApiProperty({
    description: "Request received date/time",
  })
  readonly date: string;

  @ApiProperty({
    description: "Request path",
  })
  readonly path: string;

  @ApiProperty({
    description: "Server error message",
  })
  readonly message: string;


}
