import { ApiProperty } from "@nestjs/swagger";

export class ResponseDto<T> {
  @ApiProperty({
    description: "server response",
  })
  payload: T;



  constructor(payload: T) {
    this.payload = payload;
 
  }
}
