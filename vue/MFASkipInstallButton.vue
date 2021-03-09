<template>
  <div
    class="card has-background-turquose-custom has-text-white mt-3"
    :class="baseCardClass"
    @click="handleClick"
  >
    <div class="card-content p-4">
      <div class="content">
        <div class="columns">
          <div v-if="isValidDevice" class="column">
            {{ $t('button.skip_mfa.generic') }}
          </div>
          <div v-else class="column" style="position: relative;">
            <div>
              <div>
                <div
                  v-for="({ device, translateCode, dynamicClass }, i) in deviceArr"
                  :key="i"
                  class="card has-background-white expanding-card"
                  :class="dynamicClass"
                  @click.stop="selectDevice(device)"
                >
                  <div class="card-content">
                    <div class="content">
                      {{ $t(translateCode) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mask-box" :class="maskClass" />
          </div>
          <div class="column is-2 is-flex is-justify-content-center is-align-items-center z-high">
            <b-icon
              icon="fast-forward"
              size="is-medium"
              type="is-white"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'nuxt-property-decorator'

function checkValidDevice (device: string | null): boolean {
  if (typeof device === 'string') {
    return ['phone', 'pc'].includes(device)
  }
  return false
}

@Component
export default class MFASkipBadge extends Vue {
  @Prop() device!: string | null
  chosenDevice: string | null = this.device
  isValidDevice: boolean = true
  isAnimateMask: boolean = false
  deviceArr = [
    { device: 'phone', translateCode: 'button.skip_mfa.phone.short', dynamicClass: 'mb-3' },
    { device: 'pc', translateCode: 'button.skip_mfa.pc.short', dynamicClass: 'mt-3' }
  ]

  get baseCardClass (): object {
    return { 'expanding-card': this.isValidDevice }
  }

  get maskClass (): object {
    return { 'animate-mask': this.isAnimateMask }
  }

  handleClick (): void {
    this.isValidDevice = checkValidDevice(this.chosenDevice)
    if (this.isValidDevice) {
      this.$emit('skip-install', this.chosenDevice)
    }
  }

  selectDevice (device: string): void {
    this.chosenDevice = device
    this.handleClick()
  }

  @Watch('device')
  onDeviceChange (currDeviceProp: string | null): void {
    this.chosenDevice = currDeviceProp
  }

  @Watch('isValidDevice')
  onChosenDeviceChange (val, prevVal) {
    if (!val) {
      console.log('val: ', val)
      setTimeout(() => {
        this.isAnimateMask = true
      }, 50)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~assets/scss/main.scss';

.card {
    transition: transform 0.05s ease;
}

.expanding-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.26);
  transform: scale(1.05);
  cursor: pointer;
}

.mask-box {
  position: absolute;
  background-color: $turquose-custom;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  transition: transform 0.2s ease-out;
}

.animate-mask {
  transform: translateX(100%);
}

.z-high {
  z-index: 100;
}
</style>
