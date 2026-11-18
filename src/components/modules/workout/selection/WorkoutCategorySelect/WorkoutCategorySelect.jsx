import React, { useState } from "react"
import { EditText, SingleSelect } from "../../../../atoms"

export const ADD_CATEGORY = 'Add new Category'
const DEFAULT_STYLING = { labelWidth: '12ch', labelPosition: 'before' }

/**
 * Pure category (group) selector: a select with the known groups plus an 'Add new Category'
 * option, which switches to a text field for entering a new name.
 * Reports the chosen/entered name through `onChange`.
 */
export const WorkoutCategorySelect = ({
    value, groups, onChange,
    labelWidth = DEFAULT_STYLING.labelWidth, labelPosition = DEFAULT_STYLING.labelPosition
}) => {
    const [showEdit, setShowEdit] = useState(false)
    const styling = { labelWidth, labelPosition }

    const onSelected = (selected) => {
        if (selected === ADD_CATEGORY) {
            setShowEdit(true)
            return
        }
        onChange?.(selected)
    }

    const onNewGroup = (name) => {
        setShowEdit(false)
        if (name?.length)
            onChange?.(name)
    }

    const options = [...(groups ?? [])]
    if (value && !options.includes(value))
        options.push(value)
    options.push(ADD_CATEGORY)

    if (showEdit)
        return <EditText {...styling} label='Category' value='' onValueChange={onNewGroup} />

    return <SingleSelect {...styling} label='Category' value={value} options={options} onValueChange={onSelected} />
}
