<template>
    <multiselect
        track-by='value'
        label='label'
        :show-labels='false'
        :placeholder='$t("ability")'
        :value='valueObj'
        :options='abilities'
        @input='updateValue($event)'
    ></multiselect>
</template>

<script>
import {Multiselect} from "vue-multiselect";
import translationMixin from "../mixins/translation";
import {Ability, info} from "sulcalc";

export default {
    props: {
        ability: {
            type: Ability,
            default: 0
        }
    },
    model: {
        prop: "ability",
        event: "input"
    },
    computed: {
        abilities() {
            return info.releasedAbilities(this.ability.gen)
                .filter(id => info.isAbilityUseful(id))
                .map(id => ({
                    value: id,
                    label: this.$tAbility({id})
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
        },
        valueObj() {
            if (this.ability.name === "(No Ability)") {
                return {};
            }
            return {
                value: this.ability.id,
                label: this.$tAbility(this.ability)
            };
        }
    },
    methods: {
        updateValue($event) {
            this.$emit("input", new Ability({
                id: $event ? $event.value : 0,
                gen: this.ability.gen
            }));
        }
    },
    mixins: [translationMixin],
    components: {
        Multiselect
    }
};
</script>
