export const getUintArrayByVertexLength = (length: number) => {
  if (length < 256) {
    return Uint8Array;
  } else if (length < 65536) {
    return Uint16Array;
  } else {
    return Uint32Array;
  }
}
