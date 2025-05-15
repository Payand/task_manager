import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
  @ApiProperty({
    description: "server response",
  })
  payload: T;

  @ApiProperty({
    description: "request id",
    example: "e96a05f0-1fbf-417a-830d-82e24db73454",
  })
  requestId: string;

  constructor(payload: T, requestId: string) {
    this.payload = payload;
    this.requestId = requestId;
  }
}
