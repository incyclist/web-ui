import styled from "styled-components";
import { View } from "../layout";
import { scrollbar } from "../../../utils/scrollbar";

export const TableContainer = styled(View)`
    overflow-x: hidden;
    display: block;

    ${scrollbar}
`
